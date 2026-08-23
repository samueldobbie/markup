export const MAX_SELECTED_TEXT_LENGTH = 8_000

export interface ConfigAttribute {
  name: string
  values: string[]
  allowCustomValues: boolean
}

export function isConfigAttribute(value: unknown): value is ConfigAttribute {
  if (!value || typeof value !== "object") {
    return false
  }

  const attribute = value as Record<string, unknown>

  return (
    typeof attribute.name === "string"
    && Array.isArray(attribute.values)
    && attribute.values.every((item) => typeof item === "string")
    && typeof attribute.allowCustomValues === "boolean"
  )
}
