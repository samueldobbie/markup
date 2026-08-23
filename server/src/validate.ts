import { ConfigAttribute } from "./types.js"

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
