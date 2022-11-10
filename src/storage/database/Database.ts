import { definitions } from "./Definitions"
import { supabase } from "../../utils/Supabase"

export type Workspace = definitions["workspace"]
export type WorkspaceAccess = definitions["workspace_access"]
export type WorkspaceDocument = definitions["workspace_document"]
export type RawWorkspaceDocument = Omit<Omit<definitions["workspace_document"], "id">, "created_at">
export type WorkspaceConfig = definitions["workspace_config"]
export type WorkspaceAnnotation = definitions["workspace_annotation"]
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

    workspaceAccessData.forEach((access: WorkspaceAccess) => {
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
  const { data: cofig, error } = await supabase
    .from("workspace_config")
    .insert({
      workspace_id: workspaceId,
      name: file.name,
      content: await file.text(),
    })
    .select()

  if (error) {
    console.error(error)
    // return []
  }

  return cofig[0]
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

async function addOntology(): Promise<boolean> {
  return false
}

async function getOntologies(): Promise<Ontology[]> {
  return []
}

async function deleteOntology(ontologyId: string): Promise<boolean> {
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

  addOntology,
  getOntologies,
  deleteOntology,
}
