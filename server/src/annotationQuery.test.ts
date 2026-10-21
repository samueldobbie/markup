import { HTTPException } from "hono/http-exception"
import { describe, expect, it } from "vitest"
import { compileAnnotationQuery } from "./annotationQuery.js"
import { MAX_ANNOTATION_QUERY_CONDITIONS } from "./types.js"

function compile(query: unknown) {
  return compileAnnotationQuery(JSON.stringify(query))
}

function compileError(source: string): string {
  try {
    compileAnnotationQuery(source)
  } catch (error) {
    expect(error).toBeInstanceOf(HTTPException)
    expect((error as HTTPException).status).toBe(400)
    return (error as HTTPException).message
  }

  throw new Error("Expected the query to be rejected")
}

describe("compileAnnotationQuery", () => {
  it("compiles a single filter with implicit equality", () => {
    expect(compile({ entity: "Drug" })).toEqual({
      all: ["$ ? (@.entity == \"Drug\")"],
      none: [],
    })
  })

  it("ANDs multiple fields and quotes attribute names", () => {
    expect(compile({ entity: "Drug", "attributes.Dose unit": "mg" }).all).toEqual([
      "$ ? ((@.entity == \"Drug\") && (@.attributes.\"Dose unit\" == \"mg\"))",
    ])
  })

  it("treats an array as filters that must all match", () => {
    expect(compile([{ entity: "Drug" }, { entity: "Condition" }]).all).toEqual([
      "$ ? (@.entity == \"Drug\")",
      "$ ? (@.entity == \"Condition\")",
    ])
  })

  it("supports $all and $none", () => {
    expect(compile({ $all: [{ entity: "Drug" }], $none: [{ entity: "Allergy" }] })).toEqual({
      all: ["$ ? (@.entity == \"Drug\")"],
      none: ["$ ? (@.entity == \"Allergy\")"],
    })
  })

  it.each([
    [{ entity: { $ne: "Drug" } }, "!(@.entity == \"Drug\")"],
    [{ entity: { $in: ["Drug", "Dose"] } }, "(@.entity == \"Drug\" || @.entity == \"Dose\")"],
    [{ entity: { $nin: ["Drug"] } }, "!(@.entity == \"Drug\")"],
    [{ "attributes.Dose": 10 }, "@.attributes.\"Dose\".double() == 10"],
    [{ "attributes.Dose": { $gte: 5, $lt: 20 } }, "(@.attributes.\"Dose\".double() >= 5) && (@.attributes.\"Dose\".double() < 20)"],
    [{ text: { $gt: "m" } }, "@.text > \"m\""],
    [{ "attributes.Negated": { $exists: true } }, "exists(@.attributes.\"Negated\")"],
    [{ "attributes.Negated": { $exists: false } }, "!(exists(@.attributes.\"Negated\"))"],
    [{ text: { $contains: "a.b" } }, "@.text like_regex \"a\\\\.b\" flag \"i\""],
    [{ text: { $regex: "^asp" } }, "@.text like_regex \"^asp\""],
    [{ "attributes.Flag": true }, "@.attributes.\"Flag\" == true"],
    [{ "attributes.Flag": null }, "@.attributes.\"Flag\" == null"],
  ])("compiles %j", (query, predicate) => {
    expect(compile(query).all).toEqual([`$ ? (${predicate})`])
  })

  it("compiles $and, $or and $not", () => {
    expect(compile({
      $or: [{ entity: "Drug" }, { $and: [{ entity: "Dose" }, { $not: { text: "0" } }] }],
    }).all).toEqual([
      "$ ? ((@.entity == \"Drug\") || ((@.entity == \"Dose\") && (!(@.text == \"0\"))))",
    ])
  })

  it("escapes quotes, backslashes and control characters in strings", () => {
    expect(compile({ text: "say \"hi\"\\\n\t" }).all).toEqual([
      "$ ? (@.text == \"say \\\"hi\\\"\\\\\\n\\t\")",
    ])
  })

  it.each([
    ["{not json", "Query must be valid JSON"],
    ["[]", "Query must contain at least one filter"],
    ["{}", "Filters cannot be empty"],
    ["\"Drug\"", "Each filter must be a JSON object"],
    ["{\"$all\": [], \"entity\": \"Drug\"}", "$all and $none cannot be combined with other keys (entity)"],
    ["{\"$none\": {}}", "$none must be an array of filters"],
    ["{\"$or\": []}", "$or must be a non-empty array of filters"],
    ["{\"$foo\": 1}", "Unknown operator $foo"],
    ["{\"entity\": {\"$foo\": 1}}", "Unknown operator $foo"],
    ["{\"name\": \"Drug\"}", "Unknown field \"name\""],
    ["{\"attributes.\": \"x\"}", "Unknown field \"attributes.\""],
    ["{\"entity\": {\"$in\": []}}", "$in must be a non-empty array of values"],
    ["{\"entity\": {\"$gt\": true}}", "$gt must be a number or string"],
    ["{\"entity\": {\"$exists\": 1}}", "$exists must be true or false"],
    ["{\"text\": {\"$contains\": \"\"}}", "$contains must be a non-empty string"],
    ["{\"text\": {\"$regex\": 1}}", "$regex must be a non-empty string"],
    ["{\"entity\": [\"Drug\"]}", "use $in to match any of several values"],
    ["{\"entity\": {\"$eq\": {\"a\": 1}}}", "$eq cannot compare against an object"],
  ])("rejects %s", (source, message) => {
    expect(compileError(source)).toContain(message)
  })

  it("limits the number of conditions", () => {
    const filters = Array.from({ length: MAX_ANNOTATION_QUERY_CONDITIONS + 1 }, (_, index) => ({ text: `t${index}` }))

    expect(compileError(JSON.stringify(filters))).toContain(
      `more than ${MAX_ANNOTATION_QUERY_CONDITIONS} conditions`,
    )
  })
})
