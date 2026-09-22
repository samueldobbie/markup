import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { AuthVariables, requireWorkspaceMember } from "./auth.js"
import { completeJson } from "./complete.js"
import { recordWorkspaceAnnotationFeedback } from "./feedback.js"
import { getWorkspaceModelCredentials } from "./model.js"
import { readJsonBody } from "./request.js"
import { attributesPrompt, documentAnnotationsPrompt, entityPrompt } from "./prompts.js"
import {
  ConfigAttribute,
  MAX_DOCUMENT_PROMPT_LENGTH,
  MAX_SELECTED_TEXT_LENGTH,
  isConfigAttribute,
  isWorkspaceConfigPayload,
} from "./types.js"
import { filterSuggestedAttributes, filterSuggestedEntity, resolveDocumentSuggestions } from "./validate.js"

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
  const body = await readJsonBody<{
    workspaceId: string
    selectedText: string
    availableEntities: string[]
  }>(c)

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
  const body = await readJsonBody<{
    workspaceId: string
    selectedText: string
    selectedEntity: string
    availableAttributes: ConfigAttribute[]
  }>(c)

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

suggestRoutes.post("/document", async (c) => {
  const body = await readJsonBody<{
    workspaceId: string
    document: string
    annotations: Array<{ start_index?: number, end_index?: number, entity?: string, text?: string }>
    config: unknown
    guidelines: string
  }>(c)

  const workspaceId = body.workspaceId
  const document = body.document
  const annotations = body.annotations
  const guidelines = typeof body.guidelines === "string" ? body.guidelines.slice(0, 4_000) : undefined

  if (typeof workspaceId !== "string" || workspaceId === "") {
    throw new HTTPException(400, { message: "workspaceId is required" })
  }

  if (typeof document !== "string" || document.trim() === "") {
    throw new HTTPException(400, { message: "document is required" })
  }

  if (!isWorkspaceConfigPayload(body.config)) {
    throw new HTTPException(400, { message: "config is invalid" })
  }

  if (!Array.isArray(annotations)) {
    throw new HTTPException(400, { message: "annotations must be an array" })
  }

  const existing = annotations
    .filter((annotation) => (
      typeof annotation.start_index === "number"
      && typeof annotation.end_index === "number"
    ))
    .map((annotation) => ({
      start_index: annotation.start_index as number,
      end_index: annotation.end_index as number,
      entity: typeof annotation.entity === "string" ? annotation.entity : undefined,
      text: typeof annotation.text === "string" ? annotation.text : undefined,
    }))

  await requireWorkspaceMember(c.get("userId"), workspaceId)

  const credentials = await getWorkspaceModelCredentials(workspaceId)
  const promptDocument = document.length > MAX_DOCUMENT_PROMPT_LENGTH
    ? document.slice(0, MAX_DOCUMENT_PROMPT_LENGTH)
    : document
  const parsed = await completeJson({
    ...credentials,
    prompt: documentAnnotationsPrompt(
      promptDocument,
      body.config,
      existing.map(({ entity, text, start_index, end_index }) => ({
        entity,
        text,
        start_index,
        end_index,
      })),
      guidelines,
    ),
    timeoutMs: 90_000,
  })

  return c.json({
    suggestions: resolveDocumentSuggestions(parsed, document, existing, body.config),
  })
})

suggestRoutes.post("/feedback", async (c) => {
  const body = await readJsonBody<{
    workspaceId: string
    documentId: string
    events: unknown
  }>(c)

  const workspaceId = body.workspaceId
  const documentId = body.documentId

  if (typeof workspaceId !== "string" || workspaceId === "") {
    throw new HTTPException(400, { message: "workspaceId is required" })
  }

  if (typeof documentId !== "string" || documentId === "") {
    throw new HTTPException(400, { message: "documentId is required" })
  }

  if (!Array.isArray(body.events)) {
    throw new HTTPException(400, { message: "events must be an array" })
  }

  await requireWorkspaceMember(c.get("userId"), workspaceId)

  return c.json(await recordWorkspaceAnnotationFeedback(
    c.get("userId"),
    workspaceId,
    documentId,
    body.events,
  ))
})
