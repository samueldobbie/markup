import { HTTPException } from "hono/http-exception"
import { MAX_ANNOTATION_QUERY_CONDITIONS } from "./types.js"

export interface CompiledAnnotationQuery {
  all: string[]
  none: string[]
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

const FIELD_OPERATORS = new Set([
  "$eq", "$ne", "$in", "$nin", "$gt", "$gte", "$lt", "$lte", "$exists", "$contains", "$regex",
])

export function compileAnnotationQuery(source: string): CompiledAnnotationQuery {
  let parsed: Json

  try {
    parsed = JSON.parse(source) as Json
  } catch {
    throw invalid("Query must be valid JSON")
  }

  const counter = { conditions: 0 }
  let all: Json[]
  let none: Json[] = []

  if (Array.isArray(parsed)) {
    all = parsed
  } else if (isObject(parsed) && ("$all" in parsed || "$none" in parsed)) {
    const extra = Object.keys(parsed).filter((key) => key !== "$all" && key !== "$none")

    if (extra.length > 0) {
      throw invalid(`$all and $none cannot be combined with other keys (${extra.join(", ")})`)
    }

    all = filterList(parsed.$all, "$all")
    none = filterList(parsed.$none, "$none")
  } else {
    all = [parsed]
  }

  if (all.length === 0 && none.length === 0) {
    throw invalid("Query must contain at least one filter")
  }

  return {
    all: all.map((filter) => `$ ? (${compileFilter(filter, counter)})`),
    none: none.map((filter) => `$ ? (${compileFilter(filter, counter)})`),
  }
}

function filterList(value: Json | undefined, key: string): Json[] {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw invalid(`${key} must be an array of filters`)
  }

  return value
}

function compileFilter(filter: Json, counter: { conditions: number }): string {
  if (!isObject(filter)) {
    throw invalid("Each filter must be a JSON object, e.g. {\"entity\": \"Medication\"}")
  }

  const keys = Object.keys(filter)

  if (keys.length === 0) {
    throw invalid("Filters cannot be empty")
  }

  return joinAnd(keys.map((key) => {
    const value = filter[key]

    if (key === "$and" || key === "$or") {
      if (!Array.isArray(value) || value.length === 0) {
        throw invalid(`${key} must be a non-empty array of filters`)
      }

      const parts = value.map((item) => `(${compileFilter(item, counter)})`)
      return parts.join(key === "$and" ? " && " : " || ")
    }

    if (key === "$not") {
      return `!(${compileFilter(value, counter)})`
    }

    if (key.startsWith("$")) {
      throw invalid(`Unknown operator ${key}`)
    }

    return compileField(fieldPath(key), value, counter)
  }))
}

function compileField(path: string, value: Json, counter: { conditions: number }): string {
  if (isObject(value) && Object.keys(value).some((key) => key.startsWith("$"))) {
    const keys = Object.keys(value)

    return joinAnd(keys.map((operator) => {
      if (!FIELD_OPERATORS.has(operator)) {
        throw invalid(`Unknown operator ${operator}`)
      }

      return compileOperator(path, operator, value[operator], counter)
    }))
  }

  return compileOperator(path, "$eq", value, counter)
}

function compileOperator(path: string, operator: string, value: Json, counter: { conditions: number }): string {
  counter.conditions += 1

  if (counter.conditions > MAX_ANNOTATION_QUERY_CONDITIONS) {
    throw invalid(`Query cannot have more than ${MAX_ANNOTATION_QUERY_CONDITIONS} conditions`)
  }

  switch (operator) {
    case "$eq":
      return equals(path, value, operator)
    case "$ne":
      return `!(${equals(path, value, operator)})`
    case "$in":
    case "$nin": {
      if (!Array.isArray(value) || value.length === 0) {
        throw invalid(`${operator} must be a non-empty array of values`)
      }

      const any = value.map((item) => equals(path, item, operator)).join(" || ")
      return operator === "$in" ? `(${any})` : `!(${any})`
    }
    case "$gt":
    case "$gte":
    case "$lt":
    case "$lte": {
      const comparator = { $gt: ">", $gte: ">=", $lt: "<", $lte: "<=" }[operator]

      if (typeof value === "number") {
        return `${path}.double() ${comparator} ${numberLiteral(value)}`
      }

      if (typeof value === "string") {
        return `${path} ${comparator} ${stringLiteral(value)}`
      }

      throw invalid(`${operator} must be a number or string`)
    }
    case "$exists":
      if (typeof value !== "boolean") {
        throw invalid("$exists must be true or false")
      }

      return value ? `exists(${path})` : `!(exists(${path}))`
    case "$contains":
      if (typeof value !== "string" || value === "") {
        throw invalid("$contains must be a non-empty string")
      }

      return `${path} like_regex ${stringLiteral(escapeRegex(value))} flag "i"`
    case "$regex":
      if (typeof value !== "string" || value === "") {
        throw invalid("$regex must be a non-empty string")
      }

      return `${path} like_regex ${stringLiteral(value)}`
  }

  throw invalid(`Unknown operator ${operator}`)
}

function equals(path: string, value: Json, operator: string): string {
  if (typeof value === "string") {
    return `${path} == ${stringLiteral(value)}`
  }

  if (typeof value === "number") {
    return `${path}.double() == ${numberLiteral(value)}`
  }

  if (typeof value === "boolean" || value === null) {
    return `${path} == ${String(value)}`
  }

  throw invalid(
    Array.isArray(value)
      ? `${operator} cannot compare against an array; use $in to match any of several values`
      : `${operator} cannot compare against an object`,
  )
}

function fieldPath(key: string): string {
  if (key === "entity" || key === "text") {
    return `@.${key}`
  }

  if (key.startsWith("attributes.") && key.length > "attributes.".length) {
    return `@.attributes.${stringLiteral(key.slice("attributes.".length))}`
  }

  throw invalid(`Unknown field "${key}". Use entity, text, or attributes.<name>`)
}

function stringLiteral(value: string): string {
  return `"${value
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t")}"`
}

function numberLiteral(value: number): string {
  if (!Number.isFinite(value)) {
    throw invalid("Numbers must be finite")
  }

  return String(value)
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function joinAnd(parts: string[]): string {
  return parts.length === 1 ? parts[0] : parts.map((part) => `(${part})`).join(" && ")
}

function isObject(value: Json | undefined): value is { [key: string]: Json } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function invalid(message: string): HTTPException {
  return new HTTPException(400, { message })
}
