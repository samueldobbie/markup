import { atom } from "recoil"
import { recoilPersist } from "recoil-persist"

const { persistAtom } = recoilPersist()

const showTutorialState = atom({
  key: "showTutorialState",
  default: true,
  effects: [persistAtom],
})

const tutorialProgressState = atom({
  key: "tutorialProgressState",
  default: {
    readDocs: false,
    createWorkspace: false,
    exploreOntologies: false,
  },
  effects: [persistAtom],
})

export { showTutorialState, tutorialProgressState }
