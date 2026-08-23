import { apiFetch } from "utils/Api"

export interface WorkspaceModelPublic {
  baseUrl: string
  model: string
  apiKeyLast4: string | null
  configured: boolean
}

export function getWorkspaceModel(workspaceId: string): Promise<WorkspaceModelPublic> {
  return apiFetch(`/api/workspaces/${workspaceId}/model`)
}

export function saveWorkspaceModel(
  workspaceId: string,
  input: { baseUrl: string, model: string, apiKey?: string },
): Promise<WorkspaceModelPublic> {
  return apiFetch(`/api/workspaces/${workspaceId}/model`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}
