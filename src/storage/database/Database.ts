import { definitions } from "./Definitions"
import { supabase } from "../../utils/Supabase"
import { apiFetch } from "../../utils/Api"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import { WorkspaceGuideline } from "pages/setup/GuidelinesTable"

export type Workspace = definitions["workspace"]
export type WorkspaceAccess = definitions["workspace_access"]
export type WorkspaceDocument = definitions["workspace_document"]
export type RawWorkspaceDocument = Omit<Omit<definitions["workspace_document"], "id">, "created_at">
export type WorkspaceConfig = definitions["workspace_config"]
export type WorkspaceAnnotation = definitions["workspace_annotation"]
export type RawAnnotation = Omit<Omit<Omit<Omit<definitions["workspace_annotation"], "id">, "created_at">, "document_id">, "workspace_id">
export type Ontology = definitions["ontology"]
export type OntologyAccess = definitions["ontology_access"]

async function addWorkspace(name: string, description: string): Promise<string> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""
  const workspaceId = crypto.randomUUID()

  const { error: workspaceError } = await supabase
    .from("workspace")
    .insert({
      id: workspaceId,
      name,
      description,
    })

  if (workspaceError) {
    throw new Error(workspaceError.message)
  }

  const { error: workspaceAccessError } = await supabase
    .from("workspace_access")
    .insert({
      user_id: userId,
      workspace_id: workspaceId,
      is_owner: true,
    })

  if (workspaceAccessError) {
    throw new Error(workspaceAccessError.message)
  }

  return workspaceId
}

async function updateWorkspace(workspaceId: string, name: string, description: string): Promise<void> {
  const { error: workspaceError } = await supabase
    .from("workspace")
    .update({
      name,
      description,
    })
    .eq("id", workspaceId)

  if (workspaceError) {
    throw new Error(workspaceError.message)
  }
}

async function getWorkspaces(): Promise<Record<string, Workspace[]>> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""
  const workspaceIds: string[] = []
  const result = {
    owner: [] as Workspace[],
    collaborator: [] as Workspace[],
  }

  // TODO - drop request to workspace_access

  const { data: workspaceAccessData, error: workspaceAccessError } = await supabase
    .from("workspace_access")
    .select()
    .eq("user_id", userId)
    .eq("is_demo", false)

  if (workspaceAccessError) {
    throw new Error(workspaceAccessError.message)
  }

  workspaceAccessData?.forEach((access) => {
    workspaceIds.push(access.workspace_id)
  })

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspace")
    .select()
    .in("id", workspaceIds)

  if (workspaceError) {
    throw new Error(workspaceError.message)
  }

  workspaceData?.forEach((workspace) => {
    const access = workspaceAccessData?.find((access) => access.workspace_id === workspace.id)

    if (access.is_owner) {
      result.owner.push(workspace)
    } else {
      result.collaborator.push(workspace)
    }
  })

  return result
}

async function getWorkspace(workspaceId: string): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from("workspace")
    .select()
    .eq("id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace")
    .delete()
    .eq("id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return false
}

async function addWorkspaceDocuments(workspaceId: string, files: File[]): Promise<WorkspaceDocument[]> {
  const rawDocuments = [] as RawWorkspaceDocument[]

  for (const file of files) {
    rawDocuments.push({
      workspace_id: workspaceId,
      name: file.name,
      content: await file.text(),
    })
  }

  const { data: documents, error } = await supabase
    .from("workspace_document")
    .insert(rawDocuments)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return documents
}

// PostgREST caps each response (1000 rows by default), so large reads are fetched in ranges
const FETCH_BATCH_SIZE = 1000

async function fetchAllRows<T>(
  fetchRange: (from: number, to: number) => PromiseLike<{ data: T[] | null, error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []

  for (let from = 0; ; from += FETCH_BATCH_SIZE) {
    const { data, error } = await fetchRange(from, from + FETCH_BATCH_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    rows.push(...(data ?? []))

    if (!data || data.length < FETCH_BATCH_SIZE) {
      return rows
    }
  }
}

// Documents are navigated by position, so every paged query must share this total order
function orderDocuments<T extends { order: (column: string) => T }>(query: T): T {
  return query.order("created_at").order("name").order("id")
}

// Quote a value for use inside a PostgREST or() filter
function quoteFilterValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`
}

export type WorkspaceDocumentName = Pick<WorkspaceDocument, "id" | "name">

async function getWorkspaceDocumentCount(workspaceId: string): Promise<number> {
  const { count, error } = await supabase
    .from("workspace_document")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function getWorkspaceDocumentNames(workspaceId: string, from: number, to: number): Promise<WorkspaceDocumentName[]> {
  const { data, error } = await orderDocuments(
    supabase
      .from("workspace_document")
      .select("id, name")
      .eq("workspace_id", workspaceId),
  ).range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getWorkspaceDocumentPage(workspaceId: string, from: number, to: number): Promise<WorkspaceDocument[]> {
  const { data, error } = await orderDocuments(
    supabase
      .from("workspace_document")
      .select()
      .eq("workspace_id", workspaceId),
  ).range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getWorkspaceDocumentAt(workspaceId: string, index: number): Promise<WorkspaceDocument | null> {
  const documents = await getWorkspaceDocumentPage(workspaceId, index, index)
  return documents[0] ?? null
}

// Position of a document in the workspace order, or -1 if it doesn't exist
async function getWorkspaceDocumentIndex(workspaceId: string, documentId: string): Promise<number> {
  const { data: documents, error: documentError } = await supabase
    .from("workspace_document")
    .select("created_at, name")
    .eq("workspace_id", workspaceId)
    .eq("id", documentId)

  if (documentError) {
    throw new Error(documentError.message)
  }

  if (documents.length === 0) {
    return -1
  }

  const createdAt = quoteFilterValue(documents[0].created_at)
  const name = quoteFilterValue(documents[0].name)
  const id = quoteFilterValue(documentId)

  const { count, error } = await supabase
    .from("workspace_document")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .or([
      `created_at.lt.${createdAt}`,
      `and(created_at.eq.${createdAt},name.lt.${name})`,
      `and(created_at.eq.${createdAt},name.eq.${name},id.lt.${id})`,
    ].join(","))

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

export type WorkspaceDocumentWithAnnotationCount = WorkspaceDocument & { annotation_count: number }

async function getWorkspaceDocumentPageWithAnnotationCounts(
  workspaceId: string,
  from: number,
  to: number,
): Promise<WorkspaceDocumentWithAnnotationCount[]> {
  const { data, error } = await orderDocuments(
    supabase
      .from("workspace_document")
      .select("*, workspace_annotation(count)")
      .eq("workspace_id", workspaceId),
  ).range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return data.map(({ workspace_annotation, ...document }: WorkspaceDocument & { workspace_annotation: { count: number }[] }) => ({
    ...document,
    annotation_count: workspace_annotation[0]?.count ?? 0,
  }))
}

function fileStem(name: string): string {
  return name.split(".").slice(0, -1).join(".")
}

async function findWorkspaceDocumentForFile(workspaceId: string, fileName: string): Promise<WorkspaceDocumentName | null> {
  const stem = fileStem(fileName)
  const pattern = `${stem.replace(/[\\%_]/g, "\\$&")}.%`

  const candidates = await fetchAllRows<WorkspaceDocumentName>((from, to) => (
    orderDocuments(
      supabase
        .from("workspace_document")
        .select("id, name")
        .eq("workspace_id", workspaceId)
        .like("name", pattern),
    ).range(from, to)
  ))

  // PostgREST also treats * as a wildcard, so confirm the match exactly
  return candidates.find((document) => fileStem(document.name) === stem) ?? null
}

async function deleteWorkspaceDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_document")
    .delete()
    .eq("id", documentId)

  if (error) {
    throw new Error(error.message)
  }

  return false
}

async function getWorkspaceGuideline(workspaceId: string): Promise<WorkspaceGuideline[]> {
  const { data: config, error } = await supabase
    .from("workspace_guideline")
    .select()
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return config
}

async function addWorkspaceGuideline(workspaceId: string, file: File): Promise<WorkspaceGuideline[]> {
  const { data: config, error } = await supabase
    .from("workspace_guideline")
    .insert({
      workspace_id: workspaceId,
      name: file.name,
      content: await file.text(),
    })
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return config
}

async function deleteWorkspaceGuideline(guidelineId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_guideline")
    .delete()
    .eq("id", guidelineId)

  if (error) {
    throw new Error(error.message)
  }

  return false
}

async function addWorkspaceConfig(id: string, workspaceId: string, name: string, content: string): Promise<WorkspaceConfig> {
  const { data: config, error } = await supabase
    .from("workspace_config")
    .upsert({
      id,
      workspace_id: workspaceId,
      name,
      content,
    })
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (config === null || config.length === 0) {
    throw new Error("Invalid workspace config")
  }

  return config[0]
}

async function getWorkspaceConfig(workspaceId: string): Promise<WorkspaceConfig | null> {
  const { data: config, error } = await supabase
    .from("workspace_config")
    .select()
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  if (config === null || config.length === 0) {
    return null
  }

  return config[0]
}

async function deleteWorkspaceConfig(configId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_config")
    .delete()
    .eq("id", configId)

  if (error) {
    throw new Error(error.message)
  }

  return false
}

async function addWorkspaceAnnotation(
  workspaceId: string,
  documentId: string,
  rawAnnotation: RawAnnotation,
): Promise<WorkspaceAnnotation> {
  const { data: annotation, error } = await supabase
    .from("workspace_annotation")
    .insert({
      workspace_id: workspaceId,
      document_id: documentId,
      entity: rawAnnotation.entity,
      start_index: rawAnnotation.start_index,
      end_index: rawAnnotation.end_index,
      text: rawAnnotation.text,
      attributes: rawAnnotation.attributes,
    })
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (annotation === null || annotation.length === 0) {
    throw new Error("Invalid workspace annotation")
  }

  return annotation[0]
}

async function addWorkspaceAnnotations(
  workspaceId: string,
  documentId: string,
  rawAnnotations: RawAnnotation[],
): Promise<void> {
  const { data: annotations, error } = await supabase
    .from("workspace_annotation")
    .insert(
      rawAnnotations.map((rawAnnotation) => ({
        workspace_id: workspaceId,
        document_id: documentId,
        entity: rawAnnotation.entity,
        start_index: rawAnnotation.start_index,
        end_index: rawAnnotation.end_index,
        text: rawAnnotation.text,
        attributes: rawAnnotation.attributes,
      })),
    )
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (annotations === null || annotations.length === 0) {
    throw new Error("Invalid workspace annotations")
  }
}

async function getDocumentAnnotations(documentId: string): Promise<WorkspaceAnnotation[]> {
  return fetchAllRows((from, to) => (
    supabase
      .from("workspace_annotation")
      .select()
      .eq("document_id", documentId)
      .order("id")
      .range(from, to)
  ))
}

export interface WorkspaceExport {
  documents: WorkspaceDocumentName[]
  annotations: WorkspaceAnnotation[][]
}

// Every document name and annotation in a workspace, without document content
async function getWorkspaceExport(workspaceId: string): Promise<WorkspaceExport> {
  const [documents, annotations] = await Promise.all([
    fetchAllRows<WorkspaceDocumentName>((from, to) => (
      orderDocuments(
        supabase
          .from("workspace_document")
          .select("id, name")
          .eq("workspace_id", workspaceId),
      ).range(from, to)
    )),
    fetchAllRows<WorkspaceAnnotation>((from, to) => (
      supabase
        .from("workspace_annotation")
        .select()
        .eq("workspace_id", workspaceId)
        .order("id")
        .range(from, to)
    )),
  ])

  const byDocument = new Map<string, WorkspaceAnnotation[]>()

  annotations.forEach((annotation) => {
    const group = byDocument.get(annotation.document_id) ?? []
    group.push(annotation)
    byDocument.set(annotation.document_id, group)
  })

  return {
    documents,
    annotations: documents.map((document) => byDocument.get(document.id) ?? []),
  }
}

async function deleteWorkspaceAnnotation(annotationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_annotation")
    .delete()
    .eq("id", annotationId)

  if (error) {
    throw new Error(error.message)
  }

  return false
}

async function addWorkspaceCollaborator(workspaceId: string, email: string): Promise<void> {
  await apiFetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/collaborators`, {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

async function getWorkspaceCollaboratorEmails(workspaceId: string): Promise<string[]> {
  return apiFetch(`/api/workspaces/${encodeURIComponent(workspaceId)}/collaborators`)
}

async function removeWorkspaceCollaborator(workspaceId: string, email: string): Promise<void> {
  await apiFetch(
    `/api/workspaces/${encodeURIComponent(workspaceId)}/collaborators/${encodeURIComponent(email)}`,
    { method: "DELETE" },
  )
}

async function addOntology(name: string, description: string, rows: OntologyConcept[]): Promise<void> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""
  const ontologyId = crypto.randomUUID()

  const { error: ontologyError } = await supabase
    .from("ontology")
    .insert({
      id: ontologyId,
      name,
      description,
    })

  if (ontologyError) {
    throw new Error(ontologyError.message)
  }

  const { error: ontologyAccessError } = await supabase
    .from("ontology_access")
    .insert({
      user_id: userId,
      ontology_id: ontologyId,
      is_owner: true,
    })

  if (ontologyAccessError) {
    throw new Error(ontologyAccessError.message)
  }

  const ontologyConcepts = rows.map(i => ({
    ontology_id: ontologyId,
    name: i.name,
    code: i.code,
  }))

  const { error: ontologyConceptError } = await supabase
    .from("ontology_concept")
    .insert(ontologyConcepts)

  if (ontologyConceptError) {
    throw new Error(ontologyConceptError.message)
  }
}

async function useDefaultOntology(ontologyId: string): Promise<void> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  await supabase
    .from("ontology_access")
    .insert({
      user_id: userId,
      ontology_id: ontologyId,
    })
}

async function getDefaultOntologies(): Promise<Ontology[]> {
  const { data, error } = await supabase
    .from("ontology")
    .select()
    .eq("is_default", true)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getUserOntologies(): Promise<Ontology[]> {
  return []
}

async function getWorkspaceOntologies(workspaceId: string): Promise<Ontology[]> {
  const { data: workspaceOntologyData, error: workspaceOntologyError } = await supabase
    .from("workspace_ontology")
    .select()
    .eq("workspace_id", workspaceId)

  if (workspaceOntologyError) {
    throw new Error(workspaceOntologyError.message)
  }

  const workspaceOntologyIds = workspaceOntologyData.map(i => i.ontology_id)

  const { data, error } = await supabase
    .from("ontology")
    .select()
    .in("id", workspaceOntologyIds)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function getOntologyConcepts(ontologyId: string): Promise<OntologyConcept[]> {
  const { data, error } = await supabase
    .from("ontology_concept")
    .select()
    .eq("ontology_id", ontologyId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function removeDefaultOntology(ontologyId: string): Promise<void> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { error } = await supabase
    .from("ontology_access")
    .delete()
    .eq("user_id", userId)
    .eq("ontology_id", ontologyId)

  if (error) {
    throw new Error(error.message)
  }
}

async function deleteOntology(ontologyId: string, isDefault: boolean): Promise<boolean> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  if (!isDefault) {
    const { error: ontologyError } = await supabase
      .from("ontology")
      .delete()
      .eq("id", ontologyId)

    if (ontologyError) {
      throw new Error(ontologyError.message)
    }
  } else {

    const { error: ontologyAccessError } = await supabase
      .from("ontology_access")
      .delete()
      .eq("ontology_id", ontologyId)
      .eq("user_id", userId)

    if (ontologyAccessError) {
      throw new Error(ontologyAccessError.message)
    }
  }

  return false
}

export const database = {
  addWorkspace,
  updateWorkspace,
  getWorkspaces,
  getWorkspace,
  deleteWorkspace,

  addWorkspaceDocuments,
  getWorkspaceDocumentCount,
  getWorkspaceDocumentNames,
  getWorkspaceDocumentPage,
  getWorkspaceDocumentPageWithAnnotationCounts,
  findWorkspaceDocumentForFile,
  getWorkspaceDocumentAt,
  getWorkspaceDocumentIndex,
  deleteWorkspaceDocument,

  addWorkspaceConfig,
  getWorkspaceConfig,
  deleteWorkspaceConfig,

  getWorkspaceGuideline,
  addWorkspaceGuideline,
  deleteWorkspaceGuideline,

  addWorkspaceAnnotation,
  addWorkspaceAnnotations,
  getDocumentAnnotations,
  getWorkspaceExport,
  deleteWorkspaceAnnotation,

  addWorkspaceCollaborator,
  getWorkspaceCollaboratorEmails,
  removeWorkspaceCollaborator,

  addOntology,
  getUserOntologies,
  getWorkspaceOntologies,
  getOntologyConcepts,
  useDefaultOntology,
  getDefaultOntologies,
  removeDefaultOntology,
  deleteOntology,
}
