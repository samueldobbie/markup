import { HTTPException } from "hono/http-exception"
import { supabaseAdmin } from "./supabase.js"

export async function getCollaboratorEmails(workspaceId: string): Promise<string[]> {
  const { data: access, error: accessError } = await supabaseAdmin
    .from("workspace_access")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("is_owner", false)
    .eq("is_demo", false)

  if (accessError) {
    throw new HTTPException(500, { message: "Failed to load collaborators" })
  }

  const userIds = (access ?? []).map((row) => row.user_id)

  if (userIds.length === 0) {
    return []
  }

  const { data: users, error: usersError } = await supabaseAdmin
    .from("user")
    .select("email")
    .in("id", userIds)

  if (usersError) {
    throw new HTTPException(500, { message: "Failed to load collaborators" })
  }

  return (users ?? []).map((user) => user.email).sort()
}

export async function addCollaborator(workspaceId: string, email: unknown): Promise<void> {
  const userId = await findUserIdByEmail(parseEmail(email))

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("workspace_access")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .limit(1)

  if (existingError) {
    throw new HTTPException(500, { message: "Failed to add collaborator" })
  }

  if (existing.length > 0) {
    throw new HTTPException(409, { message: "User already has access to this workspace" })
  }

  const { error } = await supabaseAdmin
    .from("workspace_access")
    .insert({
      user_id: userId,
      workspace_id: workspaceId,
      is_owner: false,
    })

  if (error) {
    throw new HTTPException(500, { message: "Failed to add collaborator" })
  }

  await syncCollaboratorCount(workspaceId)
}

export async function removeCollaborator(workspaceId: string, email: unknown): Promise<void> {
  const userId = await findUserIdByEmail(parseEmail(email))

  const { data: removed, error } = await supabaseAdmin
    .from("workspace_access")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("is_owner", false)
    .select("id")

  if (error) {
    throw new HTTPException(500, { message: "Failed to remove collaborator" })
  }

  if (removed.length === 0) {
    throw new HTTPException(404, { message: "User is not a collaborator on this workspace" })
  }

  await syncCollaboratorCount(workspaceId)
}

function parseEmail(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HTTPException(400, { message: "email is required" })
  }

  return value.trim().toLowerCase()
}

async function findUserIdByEmail(email: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("user")
    .select("id")
    .eq("email", email)
    .limit(1)

  if (error) {
    throw new HTTPException(500, { message: "Failed to look up user" })
  }

  if (data.length === 0) {
    throw new HTTPException(404, { message: "No account exists for that email" })
  }

  return data[0].id
}

async function syncCollaboratorCount(workspaceId: string): Promise<void> {
  const { count, error: countError } = await supabaseAdmin
    .from("workspace_access")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("is_owner", false)
    .eq("is_demo", false)

  if (countError) {
    throw new HTTPException(500, { message: "Failed to update collaborator count" })
  }

  const { error } = await supabaseAdmin
    .from("workspace")
    .update({ collaborators: count ?? 0 })
    .eq("id", workspaceId)

  if (error) {
    throw new HTTPException(500, { message: "Failed to update collaborator count" })
  }
}
