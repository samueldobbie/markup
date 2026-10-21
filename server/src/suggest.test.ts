import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { requireWorkspaceMember } from "./auth.js"
import { completeJson } from "./complete.js"
import { recordWorkspaceAnnotationFeedback } from "./feedback.js"
import { suggestRoutes } from "./suggest.js"
import { MAX_DOCUMENT_PROMPT_LENGTH, MAX_SELECTED_TEXT_LENGTH } from "./types.js"

vi.mock("./auth.js", () => ({ requireWorkspaceMember: vi.fn() }))
vi.mock("./complete.js", () => ({ completeJson: vi.fn() }))
vi.mock("./feedback.js", () => ({ recordWorkspaceAnnotationFeedback: vi.fn() }))
vi.mock("./model.js", () => ({
  getWorkspaceModelCredentials: vi.fn(async () => ({ baseUrl: "https://model.test", apiKey: "key", model: "m" })),
}))

const app = new Hono<{ Variables: { userId: string } }>()

app.use("*", async (c, next) => {
  c.set("userId", "user-1")
  await next()
})
app.route("/", suggestRoutes)
app.onError((error, c) => (
  error instanceof HTTPException
    ? c.json({ error: error.message }, error.status)
    : c.json({ error: "Internal server error" }, 500)
))

async function post(path: string, body: unknown) {
  const response = await app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })

  return { status: response.status, body: await response.json() as Record<string, unknown> }
}

function lastPrompt(): string {
  return vi.mocked(completeJson).mock.lastCall![0].prompt
}

const config = {
  entities: [{ name: "Drug", attributes: [{ name: "Route", values: [], allowCustomValues: true }] }],
  globalAttributes: [],
}

beforeEach(() => {
  vi.mocked(completeJson).mockReset()
  vi.mocked(requireWorkspaceMember).mockReset()
})

describe("POST /entity", () => {
  const body = { workspaceId: "ws-1", selectedText: "aspirin", availableEntities: ["Drug", "Dose"] }

  it("returns the model's entity when it is in the config", async () => {
    vi.mocked(completeJson).mockResolvedValueOnce({ entity: "Drug" })

    expect(await post("/entity", body)).toEqual({ status: 200, body: { entity: "Drug" } })
    expect(requireWorkspaceMember).toHaveBeenCalledWith("user-1", "ws-1")
    expect(vi.mocked(completeJson).mock.lastCall![0]).toMatchObject({ baseUrl: "https://model.test", apiKey: "key", model: "m" })
    expect(lastPrompt()).toContain("aspirin")
  })

  it("drops entities outside the config", async () => {
    vi.mocked(completeJson).mockResolvedValueOnce({ entity: "Allergy" })

    expect((await post("/entity", body)).body).toEqual({ entity: "" })
  })

  it.each([
    ["missing workspaceId", { ...body, workspaceId: "" }, "workspaceId is required"],
    ["non-string entities", { ...body, availableEntities: [1] }, "availableEntities must be an array of strings"],
    ["blank text", { ...body, selectedText: "   " }, "selectedText is required"],
    ["text that is too long", { ...body, selectedText: "a".repeat(MAX_SELECTED_TEXT_LENGTH + 1) }, "selectedText is too long"],
    ["an array body", [], "JSON body must be an object"],
    ["invalid JSON", "{", "Invalid JSON body"],
  ])("rejects %s", async (_label, payload, error) => {
    expect(await post("/entity", payload)).toEqual({ status: 400, body: { error } })
    expect(completeJson).not.toHaveBeenCalled()
  })

  it("rejects users who are not workspace members", async () => {
    vi.mocked(requireWorkspaceMember).mockRejectedValueOnce(new HTTPException(403, { message: "Forbidden" }))

    expect(await post("/entity", body)).toEqual({ status: 403, body: { error: "Forbidden" } })
    expect(completeJson).not.toHaveBeenCalled()
  })
})

describe("POST /attributes", () => {
  const body = {
    workspaceId: "ws-1",
    selectedText: "aspirin taken oral",
    selectedEntity: "Drug",
    availableAttributes: config.entities[0].attributes,
  }

  it("returns attributes filtered against the span and config", async () => {
    vi.mocked(completeJson).mockResolvedValueOnce({ Route: "oral", Dose: "10" })

    expect(await post("/attributes", body)).toEqual({ status: 200, body: { Route: "oral" } })
  })

  it.each([
    ["missing entity", { ...body, selectedEntity: "" }, "selectedEntity is required"],
    ["invalid attributes", { ...body, availableAttributes: [{ name: "Route" }] }, "availableAttributes is invalid"],
  ])("rejects %s", async (_label, payload, error) => {
    expect(await post("/attributes", payload)).toEqual({ status: 400, body: { error } })
  })
})

describe("POST /document", () => {
  const document = "Aspirin daily. Aspirin again."
  const body = {
    workspaceId: "ws-1",
    document,
    annotations: [{ start_index: 0, end_index: 7, entity: "Drug", text: "Aspirin" }, { entity: "Drug" }],
    config,
    guidelines: "Annotate drugs.",
  }

  it("resolves suggestions against the document, skipping existing annotations", async () => {
    vi.mocked(completeJson).mockResolvedValueOnce({ annotations: [{ entity: "Drug", text_span: "Aspirin" }] })

    const { status, body: result } = await post("/document", body)

    expect(status).toBe(200)
    expect(result.suggestions).toEqual([
      { id: expect.any(String), entity: "Drug", text: "Aspirin", start_index: 15, end_index: 22, attributes: {} },
    ])
    expect(lastPrompt()).toContain("Annotate drugs.")
    expect(vi.mocked(completeJson).mock.lastCall![0].timeoutMs).toBe(90_000)
  })

  it("truncates long documents in the prompt but resolves against the full text", async () => {
    const long = `${"x".repeat(MAX_DOCUMENT_PROMPT_LENGTH)} Aspirin`
    vi.mocked(completeJson).mockResolvedValueOnce({ annotations: [{ entity: "Drug", text_span: "Aspirin" }] })

    const { body: result } = await post("/document", { ...body, document: long, annotations: [] })

    expect(lastPrompt()).not.toContain("Aspirin")
    expect(result.suggestions).toHaveLength(1)
  })

  it.each([
    ["a blank document", { ...body, document: " " }, "document is required"],
    ["an invalid config", { ...body, config: { entities: [] } }, "config is invalid"],
    ["non-array annotations", { ...body, annotations: {} }, "annotations must be an array"],
  ])("rejects %s", async (_label, payload, error) => {
    expect(await post("/document", payload)).toEqual({ status: 400, body: { error } })
  })
})

describe("POST /feedback", () => {
  it("records feedback for workspace members", async () => {
    vi.mocked(recordWorkspaceAnnotationFeedback).mockResolvedValueOnce({ recorded: 1 })

    const events = [{ action: "accept" }]

    expect(await post("/feedback", { workspaceId: "ws-1", documentId: "doc-1", events }))
      .toEqual({ status: 200, body: { recorded: 1 } })
    expect(recordWorkspaceAnnotationFeedback).toHaveBeenCalledWith("user-1", "ws-1", "doc-1", events)
  })

  it.each([
    ["missing documentId", { workspaceId: "ws-1", events: [] }, "documentId is required"],
    ["non-array events", { workspaceId: "ws-1", documentId: "doc-1", events: {} }, "events must be an array"],
  ])("rejects %s", async (_label, payload, error) => {
    expect(await post("/feedback", payload)).toEqual({ status: 400, body: { error } })
  })
})
