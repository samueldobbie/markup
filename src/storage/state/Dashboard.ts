import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TutorialProgress {
  readDocs: boolean
  createWorkspace: boolean
  exploreOntologies: boolean
}

interface DashboardStore {
  showTutorial: boolean
  tutorialProgress: TutorialProgress
  setShowTutorial: (showTutorial: boolean) => void
  setTutorialProgress: (tutorialProgress: TutorialProgress) => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      showTutorial: true,
      tutorialProgress: {
        readDocs: false,
        createWorkspace: false,
        exploreOntologies: false,
      },
      setShowTutorial: (showTutorial) => set({ showTutorial }),
      setTutorialProgress: (tutorialProgress) => set({ tutorialProgress }),
    }),
    { name: "markup-dashboard" },
  ),
)
