import { definitions } from "pages/database/Supabase"
import { supabase } from "../../utils/Supabase"

export type Workspace = definitions["workspace"]
export type WorkspaceAccess = definitions["workspace_access"]
export type WorkspaceDocument = definitions["workspace_document"]
export type RawWorkspaceDocument = Omit<Omit<definitions["workspace_document"], "id">, "created_at">
export type WorkspaceConfig = definitions["workspace_config"]
export type Ontology = definitions["ontology"]
export type OntologyAccess = definitions["ontology_access"]

async function addWorkspace(name: string): Promise<Workspace[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data: session, error } = await supabase
    .from("workspace")
    .insert({ name })
    .select()

  if (error) {
    console.error(error)
    return []
  }

  const { error: workspaceAccessError } = await supabase
    .from("workspace_access")
    .insert({
      user_id: userId,
      session_id: session[0].id,
      role: "owner",
    })

  if (workspaceAccessError) {
    console.error(workspaceAccessError)
    return []
  }

  return session
}

async function getWorkspaces(workspaceIds: string[] = []): Promise<Workspace[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  if (workspaceIds.length === 0) {
    const { data: workspaceAccessData, error: workspaceAccessError } = await supabase
      .from("workspace_access")
      .select("session_id")
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

async function deleteWorkspace(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from("workspace")
    .delete()
    .eq("id", sessionId)

  if (error) {
    console.error(error)
    return true
  }

  return false
}

async function addWorkspaceDocuments(sessionId: string, files: File[]): Promise<WorkspaceDocument[]> {
  const rawDocuments = [] as RawWorkspaceDocument[]

  for (const file of files) {
    rawDocuments.push({
      workspace_id: sessionId,
      name: file.name,
      content: await file.text(),
    })
  }

  const { data: documents, error } = await supabase
    .from("document")
    .insert(rawDocuments)
    .select()

  if (error) {
    console.error(error)
    return []
  }

  return documents
}

async function getWorkspaceDocuments(sessionId: string): Promise<WorkspaceDocument[]> {
  const { data: documents, error } = await supabase
    .from("document")
    .select()
    .eq("session_id", sessionId)

  if (error) {
    console.error(error)
    return []
  }

  return documents
}

async function deleteWorkspaceDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("document")
    .delete()
    .eq("id", documentId)

  if (error) {
    console.error(error)
    return true
  }

  return false
}

async function addWorkspaceConfig(sessionId: string, file: File): Promise<WorkspaceConfig> {
  const { data: cofig, error } = await supabase
    .from("config")
    .insert({
      session_id: sessionId,
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

async function getWorkspaceConfig(sessionId: string): Promise<WorkspaceConfig> {
  const { data: config, error } = await supabase
    .from("config")
    .select("name")
    .eq("session_id", sessionId)

  if (error) {
    console.error(error)
    // return undefined
  }

  return config[0]
}

async function deleteWorkspaceConfig(configId: string): Promise<boolean> {
  const { error } = await supabase
    .from("config")
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
