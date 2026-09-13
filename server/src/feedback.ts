import { HTTPException } from "hono/http-exception"
import { getWorkspaceModelRow } from "./model.js"
import { supabaseAdmin } from "./supabase.js"
import { isWorkspaceConfigPayload, WorkspaceConfigPayload } from "./types.js"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_FEEDBACK_EVENTS = 50
const MAX_ENTITY_LENGTH = 200
const MAX_SPAN_TEXT_LENGTH = 8_000
const MAX_ATTRIBUTE_ENTRIES = 50
const MAX_ATTRIBUTE_KEY_LENGTH = 100
const MAX_ATTRIBUTE_VALUE_LENGTH = 2_000

export type AnnotationFeedbackAction = "accept" | "reject" | "edit"

export interface AnnotationFeedbackSpan {
  entity: string
  text: string
  start_index: number
  end_index: number
  attributes: Record<string, string>
}

export interface AnnotationFeedbackInput {
  action?: unknown
  suggestionId?: unknown
  annotationId?: unknown
  suggested?: unknown
  accepted?: unknown
}

export interface AnnotationFeedbackExportEvent {
  id: string
  created_at: string
  action: AnnotationFeedbackAction
  source: string
  document: {
    id: string
    name: string
    content: string
  } | null
  suggested: AnnotationFeedbackSpan
  accepted: AnnotationFeedbackSpan | null
  annotation_id: string | null
  model: {
    name: string
    base_url: string
  } | null
}

export interface AnnotationFeedbackExport {
  workspace: {
    id: string
    name: string
  }
  exported_at: string
  config: WorkspaceConfigPayload
  guidelines: string
  events: AnnotationFeedbackExportEvent[]
}

interface FeedbackRow {
  id: string
  created_at: string
  document_id: string
  action: AnnotationFeedbackAction
  source: string
  annotation_id: string | null
  suggested: AnnotationFeedbackSpan
  accepted: AnnotationFeedbackSpan | null
  model: string | null
  model_base_url: string | null
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value)
}

function requireUuid(value: unknown, field: string): string {
  if (!isUuid(value)) {
    throw new HTTPException(400, { message: `${field} is required` })
  }

  return value
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function parseAttributes(value: unknown): Record<string, string> {
  if (value == null) {
    return {}
  }

  if (!isPlainObject(value)) {
    throw new HTTPException(400, { message: "attributes must be an object" })
  }

  const entries = Object.entries(value)

  if (entries.length > MAX_ATTRIBUTE_ENTRIES) {
    throw new HTTPException(400, { message: "attributes has too many entries" })
  }

  const attributes: Record<string, string> = {}

  for (const [key, item] of entries) {
    if (key.length > MAX_ATTRIBUTE_KEY_LENGTH || typeof item !== "string" || item.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
      throw new HTTPException(400, { message: "attributes is invalid" })
    }

    attributes[key] = item
  }

  return attributes
}

function parseSpan(value: unknown, field: string): AnnotationFeedbackSpan {
  if (!isPlainObject(value)) {
    throw new HTTPException(400, { message: `${field} is invalid` })
  }

  const entity = value.entity
  const text = value.text
  const startIndex = value.start_index
  const endIndex = value.end_index

  if (typeof entity !== "string" || entity.trim() === "" || entity.length > MAX_ENTITY_LENGTH) {
    throw new HTTPException(400, { message: `${field}.entity is invalid` })
  }

  if (typeof text !== "string" || text.length > MAX_SPAN_TEXT_LENGTH) {
    throw new HTTPException(400, { message: `${field}.text is invalid` })
  }

  if (
    typeof startIndex !== "number"
    || typeof endIndex !== "number"
    || !Number.isInteger(startIndex)
    || !Number.isInteger(endIndex)
    || startIndex < 0
    || endIndex < startIndex
  ) {
    throw new HTTPException(400, { message: `${field} span indexes are invalid` })
  }

  return {
    entity,
    text,
    start_index: startIndex,
    end_index: endIndex,
    attributes: parseAttributes(value.attributes),
  }
}

function attributesEqual(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key])
}

export function spansEqual(left: AnnotationFeedbackSpan, right: AnnotationFeedbackSpan): boolean {
  return (
    left.entity === right.entity
    && left.text === right.text
    && left.start_index === right.start_index
    && left.end_index === right.end_index
    && attributesEqual(left.attributes, right.attributes)
  )
}

function resolveAction(
  action: unknown,
  suggested: AnnotationFeedbackSpan,
  accepted: AnnotationFeedbackSpan | null,
): AnnotationFeedbackAction {
  if (action === "reject" || accepted == null) {
    return "reject"
  }

  if (action !== "accept" && action !== "edit" && action !== "reject") {
    throw new HTTPException(400, { message: "action is invalid" })
  }

  return spansEqual(suggested, accepted) ? "accept" : "edit"
}

function parseStoredConfig(content: string | null): WorkspaceConfigPayload {
  if (!content) {
    return {
      entities: [],
      globalAttributes: [],
    }
  }

  try {
    const parsed = JSON.parse(content)

    if (isWorkspaceConfigPayload(parsed)) {
      return parsed
    }
  } catch {
    // Fall through to the empty config.
  }

  return {
    entities: [],
    globalAttributes: [],
  }
}

export async function recordWorkspaceAnnotationFeedback(
  userId: string,
  workspaceId: string,
  documentId: string,
  events: AnnotationFeedbackInput[],
): Promise<{ recorded: number }> {
  if (!Array.isArray(events) || events.length === 0) {
    throw new HTTPException(400, { message: "events must be a non-empty array" })
  }

  if (events.length > MAX_FEEDBACK_EVENTS) {
    throw new HTTPException(400, { message: "events has too many items" })
  }

  const { data: document, error: documentError } = await supabaseAdmin
    .from("workspace_document")
    .select("id")
    .eq("id", documentId)
    .eq("workspace_id", workspaceId)
    .maybeSingle()

  if (documentError) {
    throw new HTTPException(500, { message: "Failed to load document" })
  }

  if (!document) {
    throw new HTTPException(400, { message: "documentId is invalid" })
  }

  const model = await getWorkspaceModelRow(workspaceId)
  const rows = events.map((event) => {
    const suggested = parseSpan(event.suggested, "suggested")
    const accepted = event.accepted == null ? null : parseSpan(event.accepted, "accepted")
    const action = resolveAction(event.action, suggested, accepted)

    if (event.annotationId != null && !isUuid(event.annotationId)) {
      throw new HTTPException(400, { message: "annotationId is invalid" })
    }

    return {
      workspace_id: workspaceId,
      document_id: documentId,
      user_id: userId,
      action,
      source: "document_suggest",
      suggestion_id: requireUuid(event.suggestionId, "suggestionId"),
      annotation_id: action === "reject" ? null : event.annotationId ?? null,
      suggested,
      accepted: action === "reject" ? null : accepted,
      model: model?.model || null,
      model_base_url: model?.base_url || null,
    }
  })

  const { error } = await supabaseAdmin
    .from("workspace_annotation_feedback")
    .insert(rows)

  if (error) {
    console.error(error)
    throw new HTTPException(500, { message: "Failed to record annotation feedback" })
  }

  return {
    recorded: rows.length,
  }
}

export async function getWorkspaceFeedbackExport(workspaceId: string): Promise<AnnotationFeedbackExport> {
  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from("workspace")
    .select("id, name")
    .eq("id", workspaceId)
    .maybeSingle()

  if (workspaceError) {
    throw new HTTPException(500, { message: "Failed to load workspace" })
  }

  if (!workspace) {
    throw new HTTPException(404, { message: "Workspace not found" })
  }

  const [configResult, guidelineResult, documentResult, eventResult] = await Promise.all([
    supabaseAdmin
      .from("workspace_config")
      .select("content")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("workspace_guideline")
      .select("content")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("workspace_document")
      .select("id, name, content")
      .eq("workspace_id", workspaceId),
    supabaseAdmin
      .from("workspace_annotation_feedback")
      .select("id, created_at, document_id, action, source, annotation_id, suggested, accepted, model, model_base_url")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }),
  ])

  if (configResult.error || guidelineResult.error || documentResult.error || eventResult.error) {
    throw new HTTPException(500, { message: "Failed to load annotation feedback" })
  }

  const documents = new Map(
    (documentResult.data ?? []).map((document) => [document.id, document]),
  )

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
    exported_at: new Date().toISOString(),
    config: parseStoredConfig(configResult.data?.content ?? null),
    guidelines: guidelineResult.data?.content ?? "",
    events: ((eventResult.data ?? []) as FeedbackRow[]).map((event) => {
      const document = documents.get(event.document_id)

      return {
        id: event.id,
        created_at: event.created_at,
        action: event.action,
        source: event.source,
        document: document
          ? {
              id: document.id,
              name: document.name,
              content: document.content,
            }
          : null,
        suggested: event.suggested,
        accepted: event.accepted,
        annotation_id: event.annotation_id,
        model: event.model && event.model_base_url
          ? {
              name: event.model,
              base_url: event.model_base_url,
            }
          : event.model || event.model_base_url
            ? {
                name: event.model ?? "",
                base_url: event.model_base_url ?? "",
              }
            : null,
      }
    }),
  }
}
