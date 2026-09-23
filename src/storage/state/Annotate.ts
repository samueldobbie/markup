import { create } from "zustand"
import { InlineAnnotation } from "pages/annotate/Document"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import { IConfig } from "pages/setup/ConfigTable"
import { WorkspaceAnnotation, WorkspaceDocument } from "storage/database"
import { DocumentAnnotationSuggestion } from "utils/Suggest"

const MAX_HISTORY = 100

export interface AnnotationChange {
  type: "add" | "delete"
  documentId: string
  annotations: WorkspaceAnnotation[]
}

interface AnnotateStore {
  activeTutorialStep: number
  config: IConfig
  activeEntity: string
  entityColours: Record<string, string>
  populatedAttributes: Record<string, string>
  activeOntologyConcept: OntologyConcept
  documents: WorkspaceDocument[]
  documentIndex: number
  annotations: WorkspaceAnnotation[][]
  proposedAnnotation: InlineAnnotation | null
  pendingSuggestion: DocumentAnnotationSuggestion | null
  undoStack: AnnotationChange[]
  redoStack: AnnotationChange[]
  setActiveTutorialStep: (activeTutorialStep: number) => void
  setConfig: (config: IConfig) => void
  setActiveEntity: (activeEntity: string) => void
  setEntityColours: (entityColours: Record<string, string>) => void
  setPopulatedAttributes: (populatedAttributes: Record<string, string>) => void
  setActiveOntologyConcept: (activeOntologyConcept: OntologyConcept) => void
  setDocuments: (documents: WorkspaceDocument[]) => void
  setDocumentIndex: (documentIndex: number) => void
  setAnnotations: (annotations: WorkspaceAnnotation[][]) => void
  setProposedAnnotation: (proposedAnnotation: InlineAnnotation | null) => void
  setPendingSuggestion: (pendingSuggestion: DocumentAnnotationSuggestion | null) => void
  recordAnnotationChange: (change: AnnotationChange) => void
  setAnnotationHistory: (undoStack: AnnotationChange[], redoStack: AnnotationChange[]) => void
  resetAnnotationHistory: () => void
}

export const useAnnotateStore = create<AnnotateStore>((set) => ({
  activeTutorialStep: 0,
  config: {
    entities: [],
    globalAttributes: [],
  },
  activeEntity: "",
  entityColours: {},
  populatedAttributes: {},
  activeOntologyConcept: {
    name: "",
    code: "",
  },
  documents: [],
  documentIndex: 0,
  annotations: [],
  proposedAnnotation: null,
  pendingSuggestion: null,
  undoStack: [],
  redoStack: [],
  setActiveTutorialStep: (activeTutorialStep) => set({ activeTutorialStep }),
  setConfig: (config) => set({ config }),
  setActiveEntity: (activeEntity) => set({ activeEntity }),
  setEntityColours: (entityColours) => set({ entityColours }),
  setPopulatedAttributes: (populatedAttributes) => set({ populatedAttributes }),
  setActiveOntologyConcept: (activeOntologyConcept) => set({ activeOntologyConcept }),
  setDocuments: (documents) => set({ documents }),
  setDocumentIndex: (documentIndex) => set({ documentIndex }),
  setAnnotations: (annotations) => set({ annotations }),
  setProposedAnnotation: (proposedAnnotation) => set({ proposedAnnotation }),
  setPendingSuggestion: (pendingSuggestion) => set({ pendingSuggestion }),
  recordAnnotationChange: (change) => set((s) => ({
    undoStack: [...s.undoStack, change].slice(-MAX_HISTORY),
    redoStack: [],
  })),
  setAnnotationHistory: (undoStack, redoStack) => set({ undoStack, redoStack }),
  resetAnnotationHistory: () => set({ undoStack: [], redoStack: [] }),
}))
