import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

export async function readJsonBody<T extends object>(c: Context): Promise<Partial<T>> {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Invalid JSON body" })
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HTTPException(400, { message: "JSON body must be an object" })
  }

  return body as Partial<T>
}
