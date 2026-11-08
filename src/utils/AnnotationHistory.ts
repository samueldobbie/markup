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

async function applyAnnotations(documentId: string, annotations: WorkspaceAnnotation[]) {
  const updated = await Promise.all(annotations.map((annotation) => (
    database.updateWorkspaceAnnotation(annotation.id, {
      text: annotation.text,
      entity: annotation.entity,
      start_index: annotation.start_index,
      end_index: annotation.end_index,
      attributes: annotation.attributes,
    })
  )))

  const byId = new Map(updated.map((annotation) => [annotation.id, annotation]))
  const state = useAnnotateStore.getState()

  state.updateDocumentAnnotations(documentId, (current) => current.map((annotation) => byId.get(annotation.id) ?? annotation))

  if (state.editingAnnotation && byId.has(state.editingAnnotation.id)) {
    state.stopEditingAnnotation()
  }
}

function remapChange(change: AnnotationChange, idMap: Map<string, WorkspaceAnnotation>): AnnotationChange {
  return {
    ...change,
    annotations: change.annotations.map((annotation) => idMap.get(annotation.id) ?? annotation),
    previous: change.previous?.map((annotation) => {
      const mapped = idMap.get(annotation.id)
      return mapped ? { ...annotation, id: mapped.id } : annotation
    }),
  }
}

async function step(from: Stack) {
  const change = useAnnotateStore.getState()[from].at(-1)

  if (!change || applying) {
    return
  }

  applying = true

  try {
    let idMap = new Map<string, WorkspaceAnnotation>()

    if (change.type === "update") {
      await applyAnnotations(change.documentId, from === "undoStack" ? change.previous ?? [] : change.annotations)
    } else if ((change.type === "add") === (from === "undoStack")) {
      await removeAnnotations(change)
    } else {
      idMap = await restoreAnnotations(change)
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

export function deleteAnnotation(annotation: WorkspaceAnnotation) {
  database
    .deleteWorkspaceAnnotation(annotation.id)
    .then(() => {
      const state = useAnnotateStore.getState()
      state.updateDocumentAnnotations(annotation.document_id, (annotations) => annotations.filter((item) => item.id !== annotation.id))
      state.recordAnnotationChange({ type: "delete", documentId: annotation.document_id, annotations: [annotation] })
    })
    .catch((e) => notify.error("Failed to delete annotation.", e))
}
