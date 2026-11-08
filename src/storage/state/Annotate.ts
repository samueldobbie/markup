import { create } from "zustand"
import { InlineAnnotation } from "pages/annotate/Document"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import { IConfig } from "pages/setup/ConfigTable"
import { WorkspaceAnnotation, WorkspaceDocument } from "storage/database"
import { DocumentAnnotationSuggestion } from "utils/Suggest"

const MAX_HISTORY = 100

export interface AnnotationChange {
  type: "add" | "delete" | "update"
  documentId: string
  annotations: WorkspaceAnnotation[]
  previous?: WorkspaceAnnotation[]
}

interface AnnotateStore {
  config: IConfig
  activeEntity: string
  entityColours: Record<string, string>
  populatedAttributes: Record<string, string>
  activeOntologyConcept: OntologyConcept
  documentCount: number
  documentIndex: number
  document: WorkspaceDocument | null
  annotations: WorkspaceAnnotation[]
  proposedAnnotation: InlineAnnotation | null
  pendingSuggestion: DocumentAnnotationSuggestion | null
  editingAnnotation: WorkspaceAnnotation | null
  undoStack: AnnotationChange[]
  redoStack: AnnotationChange[]
  setConfig: (config: IConfig) => void
  setActiveEntity: (activeEntity: string) => void
  setEntityColours: (entityColours: Record<string, string>) => void
  setPopulatedAttributes: (populatedAttributes: Record<string, string>) => void
  setActiveOntologyConcept: (activeOntologyConcept: OntologyConcept) => void
  setDocumentCount: (documentCount: number) => void
  setDocumentIndex: (documentIndex: number) => void
  setDocument: (document: WorkspaceDocument | null, annotations: WorkspaceAnnotation[]) => void
  updateDocumentAnnotations: (documentId: string, update: (annotations: WorkspaceAnnotation[]) => WorkspaceAnnotation[]) => void
  setProposedAnnotation: (proposedAnnotation: InlineAnnotation | null) => void
  setPendingSuggestion: (pendingSuggestion: DocumentAnnotationSuggestion | null) => void
  startEditingAnnotation: (annotation: WorkspaceAnnotation) => void
  stopEditingAnnotation: () => void
  recordAnnotationChange: (change: AnnotationChange) => void
  setAnnotationHistory: (undoStack: AnnotationChange[], redoStack: AnnotationChange[]) => void
  resetAnnotationHistory: () => void
}

export const useAnnotateStore = create<AnnotateStore>((set) => ({
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
  documentCount: 0,
  documentIndex: 0,
  document: null,
  annotations: [],
  proposedAnnotation: null,
  pendingSuggestion: null,
  editingAnnotation: null,
  undoStack: [],
  redoStack: [],
  setConfig: (config) => set({ config }),
  setActiveEntity: (activeEntity) => set({ activeEntity }),
  setEntityColours: (entityColours) => set({ entityColours }),
  setPopulatedAttributes: (populatedAttributes) => set({ populatedAttributes }),
  setActiveOntologyConcept: (activeOntologyConcept) => set({ activeOntologyConcept }),
  setDocumentCount: (documentCount) => set({ documentCount }),
  setDocumentIndex: (documentIndex) => set({ documentIndex }),
  setDocument: (document, annotations) => set({ document, annotations }),
  updateDocumentAnnotations: (documentId, update) => set((s) => (
    s.document?.id === documentId ? { annotations: update(s.annotations) } : {}
  )),
  setProposedAnnotation: (proposedAnnotation) => set({ proposedAnnotation }),
  setPendingSuggestion: (pendingSuggestion) => set({ pendingSuggestion }),
  startEditingAnnotation: (annotation) => set({
    editingAnnotation: annotation,
    pendingSuggestion: null,
    proposedAnnotation: { tag: "", start: annotation.start_index, end: annotation.end_index, color: "" },
    activeEntity: annotation.entity,
    populatedAttributes: Object.fromEntries(
      Object.entries(annotation.attributes ?? {}).filter(([, value]) => typeof value === "string"),
    ) as Record<string, string>,
  }),
  stopEditingAnnotation: () => set({
    editingAnnotation: null,
    proposedAnnotation: null,
    activeEntity: "",
    populatedAttributes: {},
  }),
  recordAnnotationChange: (change) => set((s) => ({
    undoStack: [...s.undoStack, change].slice(-MAX_HISTORY),
    redoStack: [],
  })),
  setAnnotationHistory: (undoStack, redoStack) => set({ undoStack, redoStack }),
  resetAnnotationHistory: () => set({ undoStack: [], redoStack: [] }),
}))
