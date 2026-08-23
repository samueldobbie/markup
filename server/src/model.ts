import { HTTPException } from "hono/http-exception"
import { decryptSecret, encryptSecret, secretLast4 } from "./crypto.js"
import { supabaseAdmin } from "./supabase.js"

export interface WorkspaceModelRow {
  workspace_id: string
  base_url: string
  model: string
  api_key_ciphertext: string
  api_key_last4: string
}

export interface WorkspaceModelPublic {
  baseUrl: string
  model: string
  apiKeyLast4: string | null
  configured: boolean
}

export interface WorkspaceModelCredentials {
  baseUrl: string
  model: string
  apiKey: string
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1"

export function emptyModelConfig(): WorkspaceModelPublic {
  return {
    baseUrl: DEFAULT_BASE_URL,
    model: "",
    apiKeyLast4: null,
    configured: false,
  }
}

export function toPublicModel(row: WorkspaceModelRow): WorkspaceModelPublic {
  return {
    baseUrl: row.base_url,
    model: row.model,
    apiKeyLast4: row.api_key_last4,
    configured: true,
  }
}

export async function getWorkspaceModelRow(workspaceId: string): Promise<WorkspaceModelRow | null> {
  const { data, error } = await supabaseAdmin
    .from("workspace_model")
    .select("workspace_id, base_url, model, api_key_ciphertext, api_key_last4")
    .eq("workspace_id", workspaceId)
    .maybeSingle()

  if (error) {
    throw new HTTPException(500, { message: "Failed to load workspace model" })
  }

  return data
}

export async function getWorkspaceModelCredentials(workspaceId: string): Promise<WorkspaceModelCredentials> {
  const row = await getWorkspaceModelRow(workspaceId)

  if (!row) {
    throw new HTTPException(409, { message: "This workspace has no model configured" })
  }

  return {
    baseUrl: row.base_url,
    model: row.model,
    apiKey: decryptSecret(row.api_key_ciphertext),
  }
}

export function parseBaseUrl(input: string): string {
  let parsed: URL

  try {
    parsed = new URL(input)
  } catch {
    throw new HTTPException(400, { message: "Model base URL is invalid" })
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new HTTPException(400, { message: "Model base URL must be http or https" })
  }

  return parsed.toString().replace(/\/$/, "")
}

export async function upsertWorkspaceModel(
  workspaceId: string,
  input: { baseUrl: string, model: string, apiKey?: string },
): Promise<WorkspaceModelPublic> {
  const baseUrl = parseBaseUrl(input.baseUrl)
  const model = input.model.trim()

  if (!model) {
    throw new HTTPException(400, { message: "Model name is required" })
  }

  const existing = await getWorkspaceModelRow(workspaceId)
  const apiKey = input.apiKey?.trim()

  if (!apiKey && !existing) {
    throw new HTTPException(400, { message: "API key is required" })
  }

  const ciphertext = apiKey ? encryptSecret(apiKey) : existing!.api_key_ciphertext
  const last4 = apiKey ? secretLast4(apiKey) : existing!.api_key_last4

  const { data, error } = await supabaseAdmin
    .from("workspace_model")
    .upsert({
      workspace_id: workspaceId,
      base_url: baseUrl,
      model,
      api_key_ciphertext: ciphertext,
      api_key_last4: last4,
      updated_at: new Date().toISOString(),
    })
    .select("workspace_id, base_url, model, api_key_ciphertext, api_key_last4")
    .single()

  if (error || !data) {
    throw new HTTPException(500, { message: "Failed to save workspace model" })
  }

  return toPublicModel(data)
}
