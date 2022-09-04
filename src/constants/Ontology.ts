interface IAvailableOntology {
  id: string
  name: string
  scope: string
  requiresAuth: boolean
}

interface IOntology {
  id: string
  name: string
  content: IOntologyItem[]
}

interface IOntologyItem {
  type: string
  code: string
}

enum DefaultOntologyType {
  None = "none",
  Umls = "umls",
}

interface IAvailableOntology {
  id: string
  name: string
  scope: string
  requiresAuth: boolean
}

export type { DefaultOntologyType, IAvailableOntology, IOntology, IOntologyItem }
