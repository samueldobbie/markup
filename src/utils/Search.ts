import { apiFetch } from "utils/Api"

export type SearchMode = "conceptual" | "keyword" | "structured"

export interface MatchedAnnotation {
  id: string
  entity: string
  text: string
  start: number
  end: number
  attributes: Record<string, unknown>
}

export interface DocumentSearchResult {
  id: string
  name: string
  snippet: string
  reason: string | null
  matchCount?: number
  annotations?: MatchedAnnotation[]
}

export interface DocumentSearchResponse {
  mode: SearchMode
  modelConfigured: boolean
  modelFailed?: boolean
  results: DocumentSearchResult[]
}

export function searchWorkspaceDocuments(
  workspaceId: string,
  query: string,
  options?: { mode?: SearchMode, signal?: AbortSignal },
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
