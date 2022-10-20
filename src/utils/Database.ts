import { definitions } from "types/Supabase"
import { supabase } from "./Supabase"

export type Session = definitions["annotation_sessions"]
export type SessionAccess = definitions["annotation_session_access"]

export type Ontology = definitions["ontology"]
export type OntologyAccess = definitions["ontology_access"]

async function addSession(name: string): Promise<Session[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data: session, error } = await supabase
    .from("annotation_sessions")
    .insert({ name })
    .select()

  if (error) {
    console.error(error)
    return []
  }

  const { error: accessError } = await supabase
    .from("annotation_session_access")
    .insert({
      user_id: userId,
      session_id: session[0].id,
      role: "owner",
    })

  if (accessError) {
    console.error(accessError)
    return []
  }

  return session
}

async function getSessions(sessionIds: number[] = []): Promise<Session[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  if (sessionIds.length === 0) {
    const { data: accessData, error: accessError } = await supabase
    .from("annotation_session_access")
    .select("session_id")
    .eq("user_id", userId)

    accessData.forEach((access: SessionAccess) => {
      const sessionId = parseInt(access.session_id)
      sessionIds.push(sessionId)
    })
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from("annotation_sessions")
    .select()
    .in("id", sessionIds)

  sessionError && console.error(sessionError)

  return sessionData ?? []
}

async function deleteSession(sessionId: number): Promise<boolean> {
  const { error } = await supabase
    .from("annotation_sessions")
    .delete()
    .eq("id", sessionId)

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

async function deleteOntology(): Promise<boolean> {
  return false
}

export const database = {
  addSession,
  getSessions,
  deleteSession,

  addOntology,
  getOntologies,
  deleteOntology,
}
