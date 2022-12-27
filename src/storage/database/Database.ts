import { definitions } from "./Definitions"
import { supabase } from "../../utils/Supabase"
import { OntologyRow } from "pages/dashboard/OntologyTable"

export type Workspace = definitions["workspace"]
export type WorkspaceAccess = definitions["workspace_access"]
export type WorkspaceDocument = definitions["workspace_document"]
export type RawWorkspaceDocument = Omit<Omit<definitions["workspace_document"], "id">, "created_at">
export type WorkspaceConfig = definitions["workspace_config"]
export type WorkspaceAnnotation = definitions["workspace_annotation"]
export type RawAnnotation = Omit<Omit<Omit<definitions["workspace_annotation"], "id">, "created_at">, "document_id">
export type Ontology = definitions["ontology"]
export type OntologyAccess = definitions["ontology_access"]

async function addWorkspace(name: string): Promise<Workspace[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspace")
    .insert({ name })
    .select()

  if (workspaceError) {
    console.error(workspaceError)
    return []
  }

  const { error: workspaceAccessError } = await supabase
    .from("workspace_access")
    .insert({
      user_id: userId,
      workspace_id: workspace[0].id,
      role: "owner",
    })

  if (workspaceAccessError) {
    console.error(workspaceAccessError)
    return []
  }

  return workspace
}

async function getWorkspaces(workspaceIds: string[] = []): Promise<Workspace[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  if (workspaceIds.length === 0) {
    const { data: workspaceAccessData, error: workspaceAccessError } = await supabase
      .from("workspace_access")
      .select("workspace_id")
      .eq("user_id", userId)

    workspaceAccessData?.forEach((access) => {
      workspaceIds.push(access.workspace_id)
    })
  }

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspace")
    .select()
    .in("id", workspaceIds)

  workspaceError && console.error(workspaceError)

  return workspaceData ?? []
}

async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace")
    .delete()
    .eq("id", workspaceId)

  if (error) {
    console.error(error)
    return true
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
    console.error(error)
    return []
  }

  return documents
}

async function getWorkspaceDocuments(workspaceId: string): Promise<WorkspaceDocument[]> {
  const { data: documents, error } = await supabase
    .from("workspace_document")
    .select()
    .eq("workspace_id", workspaceId)

  if (error) {
    console.error(error)
    return []
  }

  return documents
}

async function deleteWorkspaceDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_document")
    .delete()
    .eq("id", documentId)

  if (error) {
    console.error(error)
    return true
  }

  return false
}

async function addWorkspaceConfig(workspaceId: string, file: File): Promise<WorkspaceConfig> {
  const { data: config, error } = await supabase
    .from("workspace_config")
    .insert({
      workspace_id: workspaceId,
      name: file.name,
      content: await file.text(),
    })
    .select()

  if (error || config === null || config.length === 0) {
    console.error(error)

    return {
      id: "",
      created_at: "",
      workspace_id: "",
      name: "",
      content: "",
    }
  }

  return config[0]
}

async function getWorkspaceConfig(workspaceId: string): Promise<WorkspaceConfig[]> {
  const { data: config, error } = await supabase
    .from("workspace_config")
    .select()
    .eq("workspace_id", workspaceId)

  if (error) {
    console.error(error)
    return []
  }

  return config
}

async function deleteWorkspaceConfig(configId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_config")
    .delete()
    .eq("id", configId)

  if (error) {
    console.error(error)
    return true
  }

  return false
}

async function addWorkspaceAnnotation(
  documentId: string,
  rawAnnotation: RawAnnotation,
): Promise<WorkspaceAnnotation> {
  const { data: annotation, error } = await supabase
    .from("workspace_annotation")
    .insert({
      document_id: documentId,
      entity: rawAnnotation.entity,
      start_index: rawAnnotation.start_index,
      end_index: rawAnnotation.end_index,
      text: rawAnnotation.text,
      attributes: rawAnnotation.attributes,
    })
    .select()

  if (error || annotation === null || annotation.length === 0) {
    console.error(error)

    return {
      id: "",
      created_at: "",
      document_id: "",
      text: "",
      start_index: -1,
      end_index: -1,
      attributes: {},
    } as WorkspaceAnnotation
  }

  return annotation[0]
}

async function getWorkspaceAnnotations(documentIds: string[]): Promise<WorkspaceAnnotation[][]> {
  const { data: annotations, error } = await supabase
    .from("workspace_annotation")
    .select()
    .in("document_id", documentIds)

  if (error || annotations === null) {
    console.error(error)
    return []
  }

  const result: WorkspaceAnnotation[][] = []

  documentIds.forEach(documentId => {
    result.push(annotations.filter(i => i.document_id === documentId))
  })

  return result
}

async function deleteWorkspaceAnnotation(annotationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace_annotation")
    .delete()
    .eq("id", annotationId)

  if (error) {
    console.error(error)
    return true
  }

  return false
}

async function addOntology(name: string, description: string, rows: OntologyRow[]): Promise<void> {
  const { data, error } = await supabase
    .from("ontology")
    .insert({
      name,
      description,
    })
    .select()

  if (error) {
    console.error(error)
    return
  }

  const ontologyId = data[0].id
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { error: errorAccess } = await supabase
    .from("ontology_access")
    .insert({
      user_id: userId,
      ontology_id: ontologyId,
      is_owner: true,
    })

  if (errorAccess) {
    console.error(errorAccess)
    return
  }

  const concepts = rows.map(i => ({
    ontology_id: ontologyId,
    concept: i.concept,
    code: i.code,
  }))

  const { error: errorRows } = await supabase
    .from("ontology_concept")
    .insert(concepts)

  if (errorRows) {
    console.error(errorRows)
    return
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
    console.error(error)
    return []
  }

  return data
}

async function getOntologies(): Promise<Ontology[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data, error } = await supabase
    .from("ontology_access")
    .select(`
      ontology (
        id,
        created_at,
        name,
        description,
        is_default
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error(error)
    return []
  }

  return data.map(i => i.ontology) as Ontology[]
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
    console.error(error)
  }
}

async function deleteOntology(ontologyId: string, isDefault: boolean): Promise<boolean> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  if (!isDefault) {
    const { error: ontologyConceptError } = await supabase
      .from("ontology_concept")
      .delete()
      .eq("ontology_id", ontologyId)

    if (ontologyConceptError) {
      console.error(ontologyConceptError)
      return true
    }

    const { error: ontologyAccessError } = await supabase
      .from("ontology_access")
      .delete()
      .eq("ontology_id", ontologyId)
      .eq("user_id", userId)

    if (ontologyAccessError) {
      console.error(ontologyAccessError)
      return true
    }

    const { error: ontologyError } = await supabase
      .from("ontology")
      .delete()
      .eq("id", ontologyId)

    if (ontologyError) {
      console.error(ontologyError)
      return true
    }
  } else {

    const { error: ontologyAccessError } = await supabase
      .from("ontology_access")
      .delete()
      .eq("ontology_id", ontologyId)
      .eq("user_id", userId)

    if (ontologyAccessError) {
      console.error(ontologyAccessError)
      return true
    }
  }

  return false
}

export const database = {
  addWorkspace,
  getWorkspaces,
  deleteWorkspace,

  addWorkspaceDocuments,
  getWorkspaceDocuments,
  deleteWorkspaceDocument,

  addWorkspaceConfig,
  getWorkspaceConfig,
  deleteWorkspaceConfig,

  addWorkspaceAnnotation,
  getWorkspaceAnnotations,
  deleteWorkspaceAnnotation,

  addOntology,
  getOntologies,
  useDefaultOntology,
  getDefaultOntologies,
  removeDefaultOntology,
  deleteOntology,
}
