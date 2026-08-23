import { apiFetch } from "utils/Api"

export function suggestEntity(
  workspaceId: string,
  selectedText: string,
  availableEntities: string[],
  signal?: AbortSignal,
): Promise<{ entity: string }> {
  return apiFetch("/api/suggest/entity", {
    method: "POST",
    body: JSON.stringify({
      workspaceId,
      selectedText,
      availableEntities,
    }),
    signal,
  })
}

export function suggestAttributes(
  workspaceId: string,
  selectedText: string,
  selectedEntity: string,
  availableAttributes: { name: string, values: string[], allowCustomValues: boolean }[],
  signal?: AbortSignal,
): Promise<Record<string, string>> {
  return apiFetch("/api/suggest/attributes", {
    method: "POST",
    body: JSON.stringify({
      workspaceId,
      selectedText,
      selectedEntity,
      availableAttributes,
    }),
    signal,
  })
}

export interface DocumentAnnotationSuggestion {
  id: string
  entity: string
  text: string
  start_index: number
  end_index: number
  attributes: Record<string, string>
}

export function suggestDocumentAnnotations(
  workspaceId: string,
  input: {
    document: string
    annotations: Array<{ entity: string, text: string, start_index: number, end_index: number }>
    config: unknown
    guidelines?: string
  },
  signal?: AbortSignal,
): Promise<{ suggestions: DocumentAnnotationSuggestion[] }> {
  return apiFetch("/api/suggest/document", {
    method: "POST",
    body: JSON.stringify({
      workspaceId,
      ...input,
    }),
    signal,
  })
}
