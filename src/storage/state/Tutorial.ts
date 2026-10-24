import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useAnnotateStore } from "storage/state/Annotate"

export enum TutorialStep {
  SelectText,
  SelectEntity,
  AddAnnotation,
}

interface TutorialStore {
  enabled: boolean
  completed: boolean
  setEnabled: (enabled: boolean) => void
  setCompleted: (completed: boolean) => void
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => ({
      enabled: false,
      completed: false,
      setEnabled: (enabled) => set({ enabled }),
      setCompleted: (completed) => set({ completed }),
    }),
    {
      name: "markup-annotate-tutorial",
      partialize: (s) => ({ completed: s.completed }),
    },
  ),
)

// The step is derived from what the user has actually done, so it can't drift
// out of sync with the annotation flow (e.g. picking an entity before any text).
export function useTutorialStep(): TutorialStep | null {
  const enabled = useTutorialStore((s) => s.enabled)
  const completed = useTutorialStore((s) => s.completed)
  const hasSelection = useAnnotateStore((s) => s.proposedAnnotation !== null)
  const hasEntity = useAnnotateStore((s) => s.activeEntity !== "")

  if (!enabled || completed) {
    return null
  }

  if (!hasSelection) {
    return TutorialStep.SelectText
  }

  return hasEntity ? TutorialStep.AddAnnotation : TutorialStep.SelectEntity
}
