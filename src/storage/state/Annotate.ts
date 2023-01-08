import { OntologyConcept } from "pages/dashboard/OntologyTable"
import { IConfig } from "pages/setup/ConfigTable"
import { atom } from "recoil"
import { WorkspaceAnnotation, WorkspaceDocument } from "storage/database"

const configState = atom({
  key: "configState",
  default: {} as IConfig,
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

const selectedOntologyConceptsState = atom<OntologyConcept[]>({
  key: "selectedOntologyConceptsState",
  default: [],
})

const documentsState = atom<WorkspaceDocument[]>({
  key: "documentsState",
  default: [],
})

const documentIndexState = atom({
  key: "documentIndexState",
  default: 0,
})

const annotationsState = atom<WorkspaceAnnotation[][]>({
  key: "annotationsState",
  default: [],
})

export {
  configState,
  documentsState,
  documentIndexState,
  activeEntityState,
  entityColoursState,
  populatedAttributeState,
  selectedOntologyConceptsState,
  annotationsState,
}
