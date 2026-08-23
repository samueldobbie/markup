import { existsSync } from "node:fs"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { AuthVariables, requireUser, requireWorkspaceMember } from "./auth.js"
import { env } from "./env.js"
import {
  emptyModelConfig,
  getWorkspaceModelRow,
  toPublicModel,
  upsertWorkspaceModel,
} from "./model.js"
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
