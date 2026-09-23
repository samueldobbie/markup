import { useWindowEvent } from "@mantine/hooks"
import { useAnnotateStore } from "storage/state/Annotate"
import { redoAnnotationChange, undoAnnotationChange } from "utils/AnnotationHistory"

const NON_TEXT_INPUT_TYPES = ["button", "checkbox", "radio", "range", "reset", "submit"]

function shouldIgnore(event: KeyboardEvent): boolean {
  const target = event.target

  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.includes(target.type)
  }

  return target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target.isContentEditable
    || target.closest("[role='dialog'], [role='menu'], [role='listbox']") !== null
}

export function useAnnotateShortcuts() {
  useWindowEvent("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || shouldIgnore(event)) {
      return
    }

    const key = event.key.toLowerCase()
    const mod = event.metaKey || event.ctrlKey

    if (mod) {
      if (key === "z" && !event.shiftKey) {
        event.preventDefault()
        undoAnnotationChange()
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault()
        redoAnnotationChange()
      }

      return
    }

    if (event.shiftKey) {
      return
    }

    const state = useAnnotateStore.getState()

    if (key === "arrowleft" || key === "arrowright") {
      const offset = key === "arrowleft" ? -1 : 1
      const nextIndex = state.documentIndex + offset

      if (nextIndex >= 0 && nextIndex < state.documents.length) {
        event.preventDefault()
        state.setDocumentIndex(nextIndex)
      }

      return
    }

    if (/^[1-9]$/.test(key)) {
      const entity = state.config.entities[Number(key) - 1]

      if (entity) {
        event.preventDefault()
        state.setActiveEntity(entity.name)

        if (state.activeTutorialStep === 0) {
          state.setActiveTutorialStep(1)
        }
      }
    }
  })
}
