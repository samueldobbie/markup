import { createClient } from "@supabase/supabase-js"

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = envUrl?.startsWith("http") ? envUrl : "http://127.0.0.1:54321"
const supabaseAnonKey = envKey && envKey !== "YOUR_SUPABASE_ANON_KEY"
  ? envKey
  : "public-anon-placeholder"

if (!envUrl?.startsWith("http")) {
  console.warn("VITE_SUPABASE_URL is missing or invalid. Copy .env.example to .env.local and add your Supabase credentials.")
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
