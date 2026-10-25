import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useAnnotateStore } from "storage/state/Annotate"

export enum TutorialStep {
  SelectText,
  SelectEntity,
  AddAnnotation,
}

interface TutorialStore {
  active: boolean
  completed: boolean
  setActive: (active: boolean) => void
  finish: () => void
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => ({
      active: false,
      completed: false,
      setActive: (active) => set({ active }),
      finish: () => set({ active: false, completed: true }),
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
  const active = useTutorialStore((s) => s.active)
  const hasSelection = useAnnotateStore((s) => s.proposedAnnotation !== null)
  const hasEntity = useAnnotateStore((s) => s.activeEntity !== "")

  if (!active) {
    return null
  }

  if (!hasSelection) {
    return TutorialStep.SelectText
  }

  return hasEntity ? TutorialStep.AddAnnotation : TutorialStep.SelectEntity
}
