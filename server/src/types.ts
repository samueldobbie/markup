export const MAX_SELECTED_TEXT_LENGTH = 8_000
export const MAX_DOCUMENT_PROMPT_LENGTH = 24_000
export const MAX_DOCUMENT_SUGGESTIONS = 25
export const MAX_OCCURRENCES_PER_SPAN = 5

export interface ConfigAttribute {
  name: string
  values: string[]
  allowCustomValues: boolean
}

export interface ConfigEntity {
  name: string
  attributes: ConfigAttribute[]
}

export interface WorkspaceConfigPayload {
  entities: ConfigEntity[]
  globalAttributes: ConfigAttribute[]
}

export function isConfigEntity(value: unknown): value is ConfigEntity {
  if (!value || typeof value !== "object") {
    return false
  }

  const entity = value as Record<string, unknown>

  return (
    typeof entity.name === "string"
    && Array.isArray(entity.attributes)
    && entity.attributes.every(isConfigAttribute)
  )
}

export function isWorkspaceConfigPayload(value: unknown): value is WorkspaceConfigPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  const config = value as Record<string, unknown>

  return (
    Array.isArray(config.entities)
    && config.entities.every(isConfigEntity)
    && Array.isArray(config.globalAttributes)
    && config.globalAttributes.every(isConfigAttribute)
  )
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
