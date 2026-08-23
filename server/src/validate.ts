import {
  ConfigAttribute,
  MAX_DOCUMENT_SUGGESTIONS,
  MAX_OCCURRENCES_PER_SPAN,
  WorkspaceConfigPayload,
} from "./types.js"

export function filterSuggestedEntity(entity: unknown, availableEntities: string[]): string {
  if (typeof entity !== "string" || entity === "") {
    return ""
  }

  return availableEntities.includes(entity) ? entity : ""
}

function valueInSpan(value: string, span: string): boolean {
  if (span.includes(value)) {
    return true
  }

  return span.toLowerCase().includes(value.toLowerCase())
}

export function filterSuggestedAttributes(
  parsed: unknown,
  selectedText: string,
  availableAttributes: ConfigAttribute[],
): Record<string, string> {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {}
  }

  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== "string" || value.trim() === "") {
      continue
    }

    const attribute = availableAttributes.find((item) => item.name === key)

    if (!attribute) {
      continue
    }

    if (!valueInSpan(value, selectedText)) {
      continue
    }

    if (attribute.values.length > 0 && !attribute.allowCustomValues && !attribute.values.includes(value)) {
      continue
    }

    result[key] = value
  }

  return result
}

export interface ExistingSpan {
  start_index: number
  end_index: number
}

export interface DocumentSuggestion {
  id: string
  entity: string
  text: string
  start_index: number
  end_index: number
  attributes: Record<string, string>
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

function findOccurrences(document: string, span: string): Array<{ start: number, end: number, text: string }> {
  if (!span || span.length < 2) {
    return []
  }

  const matches: Array<{ start: number, end: number, text: string }> = []
  let from = 0

  while (from <= document.length - span.length) {
    const start = document.indexOf(span, from)

    if (start === -1) {
      break
    }

    matches.push({
      start,
      end: start + span.length,
      text: document.slice(start, start + span.length),
    })
    from = start + span.length
  }

  if (matches.length > 0) {
    return matches
  }

  const lowerDocument = document.toLowerCase()
  const lowerSpan = span.toLowerCase()
  from = 0

  while (from <= document.length - span.length) {
    const start = lowerDocument.indexOf(lowerSpan, from)

    if (start === -1) {
      break
    }

    matches.push({
      start,
      end: start + span.length,
      text: document.slice(start, start + span.length),
    })
    from = start + span.length
  }

  return matches
}

function annotationList(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed
  }

  if (parsed && typeof parsed === "object") {
    const payload = parsed as Record<string, unknown>

    if (Array.isArray(payload.annotations)) {
      return payload.annotations
    }

    if (Array.isArray(payload.suggestions)) {
      return payload.suggestions
    }
  }

  return []
}

export function resolveDocumentSuggestions(
  parsed: unknown,
  document: string,
  existing: ExistingSpan[],
  config: WorkspaceConfigPayload,
): DocumentSuggestion[] {
  const occupied = [...existing]
  const suggestions: DocumentSuggestion[] = []

  for (const item of annotationList(parsed)) {
    if (suggestions.length >= MAX_DOCUMENT_SUGGESTIONS) {
      break
    }

    if (!item || typeof item !== "object") {
      continue
    }

    const candidate = item as Record<string, unknown>
    const entity = typeof candidate.entity === "string" ? candidate.entity : ""
    const textSpan = typeof candidate.text_span === "string"
      ? candidate.text_span
      : typeof candidate.text === "string"
        ? candidate.text
        : ""
    const configEntity = config.entities.find((entry) => entry.name === entity)

    if (!configEntity || textSpan.trim() === "") {
      continue
    }

    const availableAttributes = [...configEntity.attributes, ...config.globalAttributes]
    const attributes = filterSuggestedAttributes(candidate.attributes, textSpan, availableAttributes)
    const occurrences = findOccurrences(document, textSpan)
    let addedForSpan = 0

    for (const occurrence of occurrences) {
      if (suggestions.length >= MAX_DOCUMENT_SUGGESTIONS || addedForSpan >= MAX_OCCURRENCES_PER_SPAN) {
        break
      }

      if (occupied.some((span) => overlaps(span.start_index, span.end_index, occurrence.start, occurrence.end))) {
        continue
      }

      occupied.push({
        start_index: occurrence.start,
        end_index: occurrence.end,
      })
      suggestions.push({
        id: crypto.randomUUID(),
        entity,
        text: occurrence.text,
        start_index: occurrence.start,
        end_index: occurrence.end,
        attributes,
      })
      addedForSpan += 1
    }
  }

  return suggestions
}
