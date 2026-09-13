import { apiFetch } from "utils/Api"

export type AnnotationFeedbackAction = "accept" | "reject" | "edit"

export interface AnnotationFeedbackSpan {
  entity: string
  text: string
  start_index: number
  end_index: number
  attributes: Record<string, string>
}

export interface AnnotationFeedbackInput {
  action: AnnotationFeedbackAction
  suggestionId: string
  annotationId?: string
  suggested: AnnotationFeedbackSpan
  accepted?: AnnotationFeedbackSpan | null
}

export interface AnnotationFeedbackExport {
  workspace: {
    id: string
    name: string
  }
  exported_at: string
  config: {
    entities: unknown[]
    globalAttributes: unknown[]
  }
  guidelines: string
  events: Array<{
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
  }>
}

export function toFeedbackSpan(value: {
  entity: string
  text: string
  start_index: number
  end_index: number
  attributes?: Record<string, string> | unknown
}): AnnotationFeedbackSpan {
  const attributes: Record<string, string> = {}

  if (value.attributes && typeof value.attributes === "object" && !Array.isArray(value.attributes)) {
    for (const [key, item] of Object.entries(value.attributes as Record<string, unknown>)) {
      if (typeof item === "string") {
        attributes[key] = item
      }
    }
  }

  return {
    entity: value.entity,
    text: value.text,
    start_index: value.start_index,
    end_index: value.end_index,
    attributes,
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

export function annotationFeedbackAction(
  suggested: AnnotationFeedbackSpan,
  accepted: AnnotationFeedbackSpan,
): "accept" | "edit" {
  if (
    suggested.entity === accepted.entity
    && suggested.text === accepted.text
    && suggested.start_index === accepted.start_index
    && suggested.end_index === accepted.end_index
    && attributesEqual(suggested.attributes, accepted.attributes)
  ) {
    return "accept"
  }

  return "edit"
}

export function recordAnnotationFeedback(
  workspaceId: string,
  documentId: string,
  events: AnnotationFeedbackInput[],
): Promise<{ recorded: number }> {
  return apiFetch("/api/suggest/feedback", {
    method: "POST",
    body: JSON.stringify({
      workspaceId,
      documentId,
      events,
    }),
  })
}

export function logAnnotationFeedback(
  workspaceId: string,
  documentId: string,
  events: AnnotationFeedbackInput[],
): void {
  if (events.length === 0) {
    return
  }

  void recordAnnotationFeedback(workspaceId, documentId, events).catch((error) => {
    console.error("Failed to record annotation feedback.", error)
  })
}

export function getAnnotationFeedbackExport(workspaceId: string): Promise<AnnotationFeedbackExport> {
  return apiFetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/feedback`)
}
