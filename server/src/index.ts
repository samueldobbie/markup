import { existsSync } from "node:fs"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import {
  AuthVariables,
  optionalUser,
  requireUser,
  requireWorkspaceMember,
  requireWorkspaceOwner,
  requireWorkspaceReader,
} from "./auth.js"
import { addCollaborator, getCollaboratorEmails, removeCollaborator } from "./collaborators.js"
import { env } from "./env.js"
import { readJsonBody } from "./request.js"
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
  allowMethods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
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

  const body = await readJsonBody<{ query: unknown, mode: unknown }>(c)

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
  await requireWorkspaceOwner(c.get("userId"), workspaceId, "Only the workspace owner can configure AI")

  const body = await readJsonBody<{ baseUrl: unknown, model: unknown, apiKey: unknown }>(c)

  if (typeof body.baseUrl !== "string") {
    throw new HTTPException(400, { message: "baseUrl must be a string" })
  }

  if (body.model !== undefined && typeof body.model !== "string") {
    throw new HTTPException(400, { message: "model must be a string" })
  }

  if (body.apiKey !== undefined && typeof body.apiKey !== "string") {
    throw new HTTPException(400, { message: "apiKey must be a string" })
  }

  const saved = await upsertWorkspaceModel(workspaceId, {
    baseUrl: body.baseUrl,
    model: body.model ?? "",
    apiKey: body.apiKey,
  })

  return c.json(saved)
})

api.route("/suggest", suggestRoutes)

api.get("/workspaces/:workspaceId/collaborators", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  await requireWorkspaceOwner(c.get("userId"), workspaceId, "Only the workspace owner can manage collaborators")

  return c.json(await getCollaboratorEmails(workspaceId))
})

api.post("/workspaces/:workspaceId/collaborators", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  await requireWorkspaceOwner(c.get("userId"), workspaceId, "Only the workspace owner can manage collaborators")

  const body = await readJsonBody<{ email: unknown }>(c)
  await addCollaborator(workspaceId, body.email)

  return c.json({ ok: true })
})

api.delete("/workspaces/:workspaceId/collaborators/:email", async (c) => {
  const workspaceId = c.req.param("workspaceId")
  await requireWorkspaceOwner(c.get("userId"), workspaceId, "Only the workspace owner can manage collaborators")

  await removeCollaborator(workspaceId, c.req.param("email"))

  return c.json({ ok: true })
})

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
