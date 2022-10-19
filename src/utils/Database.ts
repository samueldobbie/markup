import { definitions } from "types/Supabase";
import { supabase } from "./Supabase";

export type Session = definitions["annotation_sessions"]
export type SessionAccess = definitions["annotation_session_access"]

async function addSession(name: string): Promise<boolean> {
  console.log(name)

  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data, error } = await supabase
    .from("annotation_sessions")
    .insert({ name })
    .select()

  if (error) {
    console.error(error)
    return true
  }

  const { error: accessError } = await supabase
    .from("annotation_session_access")
    .insert({
      user_id: userId,
      session_id: data[0].id,
      role: "owner",
    })

  if (accessError) {
    console.error(accessError)
    return true
  }

  return false
}

async function getSessions(): Promise<Session[]> {
  const user = await supabase.auth.getUser()
  const userId = user.data.user?.id ?? ""

  const { data: accessData, error: accessError } = await supabase
    .from("annotation_session_access")
    .select("session_id")
    .eq("user_id", userId)

  const sessionIds: number[] = accessData.map((i: any) => parseInt(i.session_id))

  const { data: sessionData, error: sessionError } = await supabase
    .from("annotation_sessions")
    .select()
    .in("id", sessionIds)

  sessionError && console.error(sessionError)

  return sessionData ?? []
}

export const database = { addSession, getSessions }
