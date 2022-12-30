import { definitions } from "./Definitions"
import { supabase } from "../../utils/Supabase"
import { OntologyRow } from "pages/dashboard/OntologyTable"
import { WorkspaceCollaborator } from "pages/dashboard/WorkspaceTable"

export type Workspace = definitions["workspace"]
export type WorkspaceAccess = definitions["workspace_access"]
export type WorkspaceDocument = definitions["workspace_document"]
export type RawWorkspaceDocument = Omit<Omit<definitions["workspace_document"], "id">, "created_at">
export type WorkspaceConfig = definitions["workspace_config"]
export type WorkspaceAnnotation = definitions["workspace_annotation"]
export type RawAnnotation = Omit<Omit<Omit<definitions["workspace_annotation"], "id">, "created_at">, "document_id">
export type Ontology = definitions["ontology"]
export type OntologyAccess = definitions["ontology_access"]

async function addWorkspace(name: string, description: string): Promise<Workspace[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspace")
    .insert({
      name,
      description,
    })
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
      is_owner: true,
    })

  if (workspaceAccessError) {
    console.error(workspaceAccessError)
    return []
  }

  return workspace
}

async function getWorkspaces(): Promise<Record<string, Workspace[]>> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""
  const workspaceIds: string[] = []
  const result = {
    owner: [] as Workspace[],
    collaborator: [] as Workspace[],
  }

  const { data: workspaceAccessData, error: workspaceAccessError } = await supabase
    .from("workspace_access")
    .select()
    .eq("user_id", userId)

  if (workspaceAccessError) {
    console.error(workspaceAccessError)
    return result
  }

  workspaceAccessData?.forEach((access) => {
    workspaceIds.push(access.workspace_id)
  })

  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspace")
    .select()
    .in("id", workspaceIds)

  if (workspaceError) {
    console.error(workspaceError)
    return result
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
  const { data: workspaceData, error: workspaceError } = await supabase
    .from("workspace")
    .select()
    .eq("id", workspaceId)

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

async function addWorkspaceAnnotations(
  documentId: string,
  rawAnnotations: RawAnnotation[],
): Promise<void> {
  const { data: annotations, error } = await supabase
    .from("workspace_annotation")
    .insert(
      rawAnnotations.map((rawAnnotation) => ({
        document_id: documentId,
        entity: rawAnnotation.entity,
        start_index: rawAnnotation.start_index,
        end_index: rawAnnotation.end_index,
        text: rawAnnotation.text,
        attributes: rawAnnotation.attributes,
      })),
    )
    .select()

  if (error || annotations === null || annotations.length === 0) {
    console.error(error)
  }
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

async function addWorkspaceCollaborator(workspaceId: string, email: string): Promise<WorkspaceCollaborator> {
  const { data: user, error: errorUser } = await supabase
    .from("users")
    .select()
    .eq("email", email)

  if (errorUser || user === null || user.length === 0) {
    console.error(errorUser)
    throw new Error("User not found")
  }

  const { data: access, error: errorAccess } = await supabase
    .from("workspace_access")
    .insert({
      workspace_id: workspaceId,
      user_id: user[0].id,
    })
    .select()

  if (errorAccess || access === null || access.length === 0) {
    console.error(errorAccess)
    throw new Error("Error adding collaborator")
  }

  const { data: workspace, error: errorWorkspace } = await supabase
    .from("workspace")
    .select()
    .eq("id", workspaceId)

  if (errorWorkspace || workspace === null || workspace.length === 0) {
    console.error(errorWorkspace)
    throw new Error("Workspace not found")
  }

  const { error: errorUpdate } = await supabase
    .from("workspace")
    .update({
      collaborators: workspace[0].collaborators + 1,
    })
    .eq("id", workspaceId)

  if (errorUpdate) {
    console.error(errorUpdate)
    throw new Error("Error updating workspace")
  }

  return {
    access_id: access[0].id,
    user_id: user[0].id,
    email: user[0].email,
  }
}

async function getWorkspaceCollaborators(workspaceId: string): Promise<WorkspaceCollaborator[]> {
  const { data: accessData, error } = await supabase
    .from("workspace_access")
    .select()
    .eq("workspace_id", workspaceId)

  if (error) {
    console.error(error)
    return []
  }

  const collaborators: WorkspaceCollaborator[] = []
  const userIds = accessData.map(i => i.user_id)

  const { data: userData, error: errorUsers } = await supabase
    .from("users")
    .select()
    .in("id", userIds)

  if (errorUsers) {
    console.error(errorUsers)
    return []
  }

  accessData.forEach(i => {
    const user = userData.find(j => j.id === i.user_id)

    if (user) {
      collaborators.push({
        access_id: i.id,
        user_id: user.id,
        email: user.email,
      })
    }
  })

  return collaborators
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
  getWorkspace,
  deleteWorkspace,

  addWorkspaceDocuments,
  getWorkspaceDocuments,
  deleteWorkspaceDocument,

  addWorkspaceConfig,
  getWorkspaceConfig,
  deleteWorkspaceConfig,

  addWorkspaceAnnotation,
  addWorkspaceAnnotations,
  getWorkspaceAnnotations,
  deleteWorkspaceAnnotation,

  addWorkspaceCollaborator,
  getWorkspaceCollaborators,

  addOntology,
  getOntologies,
  useDefaultOntology,
  getDefaultOntologies,
  removeDefaultOntology,
  deleteOntology,
}
