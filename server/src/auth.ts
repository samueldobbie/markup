import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { supabaseAdmin } from "./supabase.js"

export type AuthVariables = {
  userId: string
}

async function userIdFromToken(header: string | undefined): Promise<string | undefined> {
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined

  if (!token) {
    return undefined
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    throw new HTTPException(401, { message: "Invalid access token" })
  }

  return data.user.id
}

export const requireUser = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const userId = await userIdFromToken(c.req.header("Authorization"))

  if (!userId) {
    throw new HTTPException(401, { message: "Missing access token" })
  }

  c.set("userId", userId)
  await next()
})

export const optionalUser = createMiddleware<{ Variables: Partial<AuthVariables> }>(async (c, next) => {
  c.set("userId", await userIdFromToken(c.req.header("Authorization")))
  await next()
})

export async function requireWorkspaceMember(userId: string, workspaceId: string): Promise<void> {
  if (!await isWorkspaceMember(userId, workspaceId)) {
    throw new HTTPException(403, { message: "You do not have access to this workspace" })
  }
}

export async function requireWorkspaceOwner(userId: string, workspaceId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("workspace_access")
    .select("id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("is_owner", true)
    .limit(1)

  if (error) {
    throw new HTTPException(500, { message: "Failed to verify workspace access" })
  }

  if (data.length === 0) {
    throw new HTTPException(403, { message: "Only the workspace owner can manage collaborators" })
  }
}

async function isWorkspaceMember(userId: string, workspaceId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("workspace_access")
    .select("id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle()

  if (error) {
    throw new HTTPException(500, { message: "Failed to verify workspace access" })
  }

  return data !== null
}

async function isDemoWorkspace(workspaceId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("workspace_access")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("is_demo", true)
    .limit(1)

  if (error) {
    throw new HTTPException(500, { message: "Failed to verify workspace access" })
  }

  return data.length > 0
}

export async function requireWorkspaceReader(
  userId: string | undefined,
  workspaceId: string,
): Promise<{ isMember: boolean }> {
  if (userId && await isWorkspaceMember(userId, workspaceId)) {
    return { isMember: true }
  }

  if (await isDemoWorkspace(workspaceId)) {
    return { isMember: false }
  }

  if (!userId) {
    throw new HTTPException(401, { message: "Missing access token" })
  }

  throw new HTTPException(403, { message: "You do not have access to this workspace" })
}
