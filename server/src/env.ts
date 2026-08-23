import { config } from "dotenv"

config({ path: ".env.local" })
config()

function required(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not set`)
  }

  return value
}

export const env = {
  port: Number(process.env.PORT) || 8080,
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321",
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  modelCredentialsKey: required("MODEL_CREDENTIALS_KEY"),
}
