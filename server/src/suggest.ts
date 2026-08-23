import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { AuthVariables, requireWorkspaceMember } from "./auth.js"
import { completeJson } from "./complete.js"
import { getWorkspaceModelCredentials } from "./model.js"
import { attributesPrompt, entityPrompt } from "./prompts.js"
import { ConfigAttribute, MAX_SELECTED_TEXT_LENGTH, isConfigAttribute } from "./types.js"
import { filterSuggestedAttributes, filterSuggestedEntity } from "./validate.js"

export const suggestRoutes = new Hono<{ Variables: AuthVariables }>()

function requireSelectedText(selectedText: unknown): string {
  if (typeof selectedText !== "string" || selectedText.trim() === "") {
    throw new HTTPException(400, { message: "selectedText is required" })
  }

  if (selectedText.length > MAX_SELECTED_TEXT_LENGTH) {
    throw new HTTPException(400, { message: "selectedText is too long" })
  }

  return selectedText
}

suggestRoutes.post("/entity", async (c) => {
  const body = await c.req.json<{
    workspaceId?: string
    selectedText?: string
    availableEntities?: string[]
  }>()

  const workspaceId = body.workspaceId
  const availableEntities = body.availableEntities

  if (typeof workspaceId !== "string" || workspaceId === "") {
    throw new HTTPException(400, { message: "workspaceId is required" })
  }

  if (!Array.isArray(availableEntities) || !availableEntities.every((item) => typeof item === "string")) {
    throw new HTTPException(400, { message: "availableEntities must be an array of strings" })
  }

  const selectedText = requireSelectedText(body.selectedText)
  await requireWorkspaceMember(c.get("userId"), workspaceId)

  const credentials = await getWorkspaceModelCredentials(workspaceId)
  const parsed = await completeJson({
    ...credentials,
    prompt: entityPrompt(selectedText, availableEntities),
  }) as { entity?: unknown }

  return c.json({
    entity: filterSuggestedEntity(parsed?.entity, availableEntities),
  })
})

suggestRoutes.post("/attributes", async (c) => {
  const body = await c.req.json<{
    workspaceId?: string
    selectedText?: string
    selectedEntity?: string
    availableAttributes?: ConfigAttribute[]
  }>()

  const workspaceId = body.workspaceId
  const selectedEntity = body.selectedEntity
  const availableAttributes = body.availableAttributes

  if (typeof workspaceId !== "string" || workspaceId === "") {
    throw new HTTPException(400, { message: "workspaceId is required" })
  }

  if (typeof selectedEntity !== "string" || selectedEntity === "") {
    throw new HTTPException(400, { message: "selectedEntity is required" })
  }

  if (!Array.isArray(availableAttributes) || !availableAttributes.every(isConfigAttribute)) {
    throw new HTTPException(400, { message: "availableAttributes is invalid" })
  }

  const selectedText = requireSelectedText(body.selectedText)
  await requireWorkspaceMember(c.get("userId"), workspaceId)

  const credentials = await getWorkspaceModelCredentials(workspaceId)
  const parsed = await completeJson({
    ...credentials,
    prompt: attributesPrompt(selectedText, selectedEntity, availableAttributes),
  })

  return c.json(filterSuggestedAttributes(parsed, selectedText, availableAttributes))
})
