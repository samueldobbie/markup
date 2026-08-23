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
