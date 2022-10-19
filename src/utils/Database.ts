import { supabase } from "./Supabase";

async function addAnnotationSession(name: string) {
  await supabase
    .from("annotation_sessions")
    .insert({ name })
}

export { addAnnotationSession }
