import { apiFetch } from "utils/Api"

export interface DocumentSearchResult {
  id: string
  name: string
  snippet: string
  reason: string | null
}

export interface DocumentSearchResponse {
  mode: "conceptual" | "keyword"
  modelConfigured: boolean
  results: DocumentSearchResult[]
}

export function searchWorkspaceDocuments(
  workspaceId: string,
  query: string,
  options?: { mode?: "conceptual" | "keyword", signal?: AbortSignal },
): Promise<DocumentSearchResponse> {
  return apiFetch(`/api/workspaces/${workspaceId}/search`, {
    method: "POST",
    body: JSON.stringify({
      query,
      mode: options?.mode ?? "conceptual",
    }),
    signal: options?.signal,
  })
}
