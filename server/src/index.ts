import { existsSync } from "node:fs"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import { AuthVariables, optionalUser, requireUser } from "./auth.js"
import { collaboratorRoutes } from "./collaborators.js"
import { env } from "./env.js"
import { feedbackRoutes } from "./feedback.js"
import { modelRoutes } from "./model.js"
import { searchRoutes } from "./search.js"
import { suggestRoutes } from "./suggest.js"

const app = new Hono()

app.use("*", secureHeaders())

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

publicApi.route("/", searchRoutes)

const api = new Hono<{ Variables: AuthVariables }>()

api.use("*", requireUser)

api.route("/", modelRoutes)
api.route("/suggest", suggestRoutes)
api.route("/", collaboratorRoutes)
api.route("/", feedbackRoutes)

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
