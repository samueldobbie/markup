import { supabase } from "utils/Supabase"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...init?.headers,
    },
  })

  const payload = await response.json().catch(() => ({})) as { error?: string }

  if (!response.ok) {
    throw new ApiError(payload.error || "Request failed", response.status)
  }

  return payload as T
}
