import { database, WorkspaceAnnotation } from "storage/database"
import { AnnotationChange, useAnnotateStore } from "storage/state/Annotate"
import notify from "utils/Notifications"

type Stack = "undoStack" | "redoStack"

let applying = false

async function removeAnnotations(change: AnnotationChange) {
  await Promise.all(change.annotations.map((annotation) => database.deleteWorkspaceAnnotation(annotation.id)))

  const removedIds = new Set(change.annotations.map((annotation) => annotation.id))
  useAnnotateStore.getState().updateDocumentAnnotations(change.documentId, (annotations) => (
    annotations.filter((annotation) => !removedIds.has(annotation.id))
  ))
}

// Restored annotations get new ids, so return a map from old to new for the history to follow
async function restoreAnnotations(change: AnnotationChange): Promise<Map<string, WorkspaceAnnotation>> {
  const restored = await Promise.all(change.annotations.map((annotation) => (
    database.addWorkspaceAnnotation(annotation.workspace_id, change.documentId, {
      text: annotation.text,
      entity: annotation.entity,
      start_index: annotation.start_index,
      end_index: annotation.end_index,
      attributes: annotation.attributes,
    })
  )))

  useAnnotateStore.getState().updateDocumentAnnotations(change.documentId, (annotations) => [...annotations, ...restored])

  return new Map(change.annotations.map((annotation, index) => [annotation.id, restored[index]]))
}

function remapChange(change: AnnotationChange, idMap: Map<string, WorkspaceAnnotation>): AnnotationChange {
  return {
    ...change,
    annotations: change.annotations.map((annotation) => idMap.get(annotation.id) ?? annotation),
  }
}

async function step(from: Stack) {
  const change = useAnnotateStore.getState()[from].at(-1)

  if (!change || applying) {
    return
  }

  applying = true

  try {
    const shouldRemove = (change.type === "add") === (from === "undoStack")
    const idMap = shouldRemove ? new Map<string, WorkspaceAnnotation>() : await restoreAnnotations(change)

    if (shouldRemove) {
      await removeAnnotations(change)
    }

    const to: Stack = from === "undoStack" ? "redoStack" : "undoStack"
    const state = useAnnotateStore.getState()
    const remaining = state[from].filter((item) => item !== change).map((item) => remapChange(item, idMap))
    const moved = [...state[to].map((item) => remapChange(item, idMap)), remapChange(change, idMap)]

    if (from === "undoStack") {
      state.setAnnotationHistory(remaining, moved)
    } else {
      state.setAnnotationHistory(moved, remaining)
    }

    const workspaceId = change.annotations[0]?.workspace_id

    if (workspaceId && change.documentId !== state.document?.id) {
      const index = await database.getWorkspaceDocumentIndex(workspaceId, change.documentId)

      if (index >= 0) {
        state.setDocumentIndex(index)
      }
    }
  } catch (e) {
    notify.error(`Failed to ${from === "undoStack" ? "undo" : "redo"} annotation change.`, e instanceof Error ? e : undefined)
  } finally {
    applying = false
  }
}

export const undoAnnotationChange = () => step("undoStack")
export const redoAnnotationChange = () => step("redoStack")
