import { atom } from "recoil"

export interface Annotation {
  start: number
  end: number
  text: string
  entity: string
  attributes: Attribute[]
}

interface Attribute {
  text: string
}

const activeEntityState = atom({
  key: "activeEntityState",
  default: "",
})

const entityColoursState = atom<Record<string, string>>({
  key: "entityColoursState",
  default: {},
})

const annotationsState = atom<Annotation[]>({
  key: "annotationsState",
  default: [],
})

export { activeEntityState, entityColoursState, annotationsState }
