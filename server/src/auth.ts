import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { supabaseAdmin } from "./supabase.js"

export type AuthVariables = {
  userId: string
}

export const requireUser = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const header = c.req.header("Authorization")
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined

  if (!token) {
    throw new HTTPException(401, { message: "Missing access token" })
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    throw new HTTPException(401, { message: "Invalid access token" })
  }

  c.set("userId", data.user.id)
  await next()
})

export async function requireWorkspaceMember(userId: string, workspaceId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("workspace_access")
    .select("id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle()

  if (error) {
    throw new HTTPException(500, { message: "Failed to verify workspace access" })
  }

  if (!data) {
    throw new HTTPException(403, { message: "You do not have access to this workspace" })
  }
}
