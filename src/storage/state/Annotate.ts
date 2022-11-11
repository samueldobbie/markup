import { atom } from "recoil"
import { WorkspaceAnnotation } from "storage/database"

const documentIndexState = atom({
  key: "documentIndexState",
  default: 0,
})

const activeEntityState = atom({
  key: "activeEntityState",
  default: "",
})

const entityColoursState = atom<Record<string, string>>({
  key: "entityColoursState",
  default: {},
})

const populatedAttributeState = atom<Record<string, string[]>>({
  key: "populatedAttributeState",
  default: {},
})

const annotationsState = atom<WorkspaceAnnotation[][]>({
  key: "annotationsState",
  default: [],
})

export {
  documentIndexState,
  activeEntityState,
  entityColoursState,
  populatedAttributeState,
  annotationsState,
}
