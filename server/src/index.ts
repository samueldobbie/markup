import { existsSync } from "node:fs"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { AuthVariables, optionalUser, requireUser, requireWorkspaceMember, requireWorkspaceReader } from "./auth.js"
import { env } from "./env.js"
import {
  emptyModelConfig,
  getWorkspaceModelRow,
  toPublicModel,
  upsertWorkspaceModel,
} from "./model.js"
import { getWorkspaceFeedbackExport } from "./feedback.js"
import { searchWorkspaceDocuments } from "./search.js"
import { suggestRoutes } from "./suggest.js"

const app = new Hono()

app.use("/api/*", cors({
  origin: ["http://localhost:3000"],
  allowHeaders: ["Authorization", "Content-Type"],
  allowMethods: ["GET", "PUT", "POST", "OPTIONS"],
}))

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status)
  }

  console.error(error)
  return c.json({ error: "Internal server error" }, 500)
})

app.get("/api/health", (c) => c.json({ ok: true }))

const publicApi = new Hono<{ Variables: Partial<AuthVariables> }>()

publicApi.use("*", optionalUser)

publicApi.post("/workspaces/:workspaceId/search", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  const { isMember } = await requireWorkspaceReader(c.get("userId"), workspaceId)

  let body: { query?: unknown, mode?: unknown }

  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Invalid JSON body" })
  }

  return c.json(await searchWorkspaceDocuments(workspaceId, body, { allowConceptual: isMember }))
})

const api = new Hono<{ Variables: AuthVariables }>()

api.use("*", requireUser)

api.get("/workspaces/:workspaceId/model", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  await requireWorkspaceMember(c.get("userId"), workspaceId)

  const row = await getWorkspaceModelRow(workspaceId)

  return c.json(row ? toPublicModel(row) : emptyModelConfig())
})

api.put("/workspaces/:workspaceId/model", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  await requireWorkspaceMember(c.get("userId"), workspaceId)

  const body = await c.req.json<{
    baseUrl?: string
    model?: string
    apiKey?: string
  }>()

  const saved = await upsertWorkspaceModel(workspaceId, {
    baseUrl: body.baseUrl ?? "",
    model: body.model ?? "",
    apiKey: body.apiKey,
  })

  return c.json(saved)
})

api.route("/suggest", suggestRoutes)

api.get("/workspaces/:workspaceId/feedback", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  await requireWorkspaceMember(c.get("userId"), workspaceId)

  return c.json(await getWorkspaceFeedbackExport(workspaceId))
})

app.route("/api", publicApi)
app.route("/api", api)

if (existsSync("dist/index.html")) {
  app.use("/*", serveStatic({ root: "./dist" }))
  app.get("*", serveStatic({ path: "./dist/index.html" }))
}

serve({
  fetch: app.fetch,
  port: env.port,
}, (info) => {
  console.log(`API listening on http://localhost:${info.port}`)
})
