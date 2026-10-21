import { HTTPException } from "hono/http-exception"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { completeJson } from "./complete.js"
import { getWorkspaceModelCredentials, getWorkspaceModelRow } from "./model.js"
import { searchWorkspaceDocuments } from "./search.js"
import { supabaseAdmin } from "./supabase.js"
import { MAX_SEARCH_QUERY_LENGTH, SEARCH_JUDGE_BATCH_SIZE } from "./types.js"

vi.mock("./complete.js", () => ({ completeJson: vi.fn() }))
vi.mock("./model.js", () => ({ getWorkspaceModelRow: vi.fn(), getWorkspaceModelCredentials: vi.fn() }))
vi.mock("./supabase.js", () => ({ supabaseAdmin: { from: vi.fn(), rpc: vi.fn() } }))

interface Row {
  id: string
  name: string
  content: string
}

interface RecordedQuery {
  table: string
  ops: Array<[string, unknown[]]>
}

type Result = { data: unknown, error: unknown }

let respond: (query: RecordedQuery) => Result
let queries: RecordedQuery[]

function builder(query: RecordedQuery): unknown {
  return new Proxy({}, {
    get(_target, property) {
      if (property === "then") {
        return (resolve: (value: Result) => void) => resolve(respond(query))
      }

      return (...args: unknown[]) => {
        query.ops.push([String(property), args])
        return builder(query)
      }
    },
  })
}

function op(query: RecordedQuery, name: string): unknown[] | undefined {
  return query.ops.find(([opName]) => opName === name)?.[1]
}

function isFts(query: RecordedQuery) {
  return op(query, "textSearch") !== undefined
}

function isNameSearch(query: RecordedQuery) {
  const filter = op(query, "or")?.[0] as string | undefined
  return filter !== undefined && !filter.includes("content.ilike")
}

const docs: Record<string, Row> = {
  aspirin: { id: "doc-1", name: "aspirin.txt", content: "Patient took <b>aspirin</b> for a headache." },
  migraine: { id: "doc-2", name: "migraine.txt", content: "History of migraine, treated with ibuprofen." },
  other: { id: "doc-3", name: "aspirin-notes.txt", content: "No relevant terms here." },
}

const highlight = (text: string) => `<span style="background-color: #FDE047">${text}</span>`

const credentials = { baseUrl: "https://model.test", apiKey: "key", model: "m" }

beforeEach(() => {
  queries = []
  respond = () => ({ data: [], error: null })
  vi.mocked(supabaseAdmin.from).mockReset().mockImplementation(((table: string) => {
    const query = { table, ops: [] }
    queries.push(query)
    return builder(query)
  }) as never)
  vi.mocked(supabaseAdmin.rpc).mockReset()
  vi.mocked(completeJson).mockReset()
  vi.mocked(getWorkspaceModelRow).mockReset().mockResolvedValue(null)
  vi.mocked(getWorkspaceModelCredentials).mockReset().mockResolvedValue(credentials)
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("input validation", () => {
  it.each([
    [{ query: "  " }, "query is required"],
    [{ query: 5 }, "query is required"],
    [{ query: "a".repeat(MAX_SEARCH_QUERY_LENGTH + 1) }, "query is too long"],
    [{ query: "aspirin", mode: "fuzzy" }, "mode must be conceptual, keyword or structured"],
  ])("rejects %j", async (input, message) => {
    const error = await searchWorkspaceDocuments("ws-1", input, { allowConceptual: true }).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(HTTPException)
    expect((error as HTTPException).status).toBe(400)
    expect((error as HTTPException).message).toBe(message)
  })
})

describe("keyword search", () => {
  it("merges full-text and name matches with highlighted, escaped snippets", async () => {
    respond = (query) => ({
      data: isFts(query) ? [docs.aspirin] : isNameSearch(query) ? [docs.aspirin, docs.other] : [],
      error: null,
    })

    const response = await searchWorkspaceDocuments("ws-1", { query: " aspirin ", mode: "keyword" }, { allowConceptual: false })

    expect(getWorkspaceModelRow).not.toHaveBeenCalled()
    expect(response).toEqual({
      mode: "keyword",
      modelConfigured: false,
      results: [
        {
          id: "doc-1",
          name: "aspirin.txt",
          snippet: `Patient took &lt;b&gt;${highlight("aspirin")}&lt;/b&gt; for a headache.`,
          reason: null,
        },
        { id: "doc-3", name: "aspirin-notes.txt", snippet: "No relevant terms here.", reason: null },
      ],
    })

    const fts = queries.find(isFts)!
    expect(fts.table).toBe("workspace_document")
    expect(op(fts, "eq")).toEqual(["workspace_id", "ws-1"])
    expect(op(fts, "textSearch")).toEqual(["content", "aspirin", { type: "websearch", config: "english" }])
  })

  it("quotes multi-word terms and strips websearch syntax", async () => {
    await searchWorkspaceDocuments("ws-1", { query: "\"chest: pain\", (acute)", mode: "keyword" }, { allowConceptual: false })

    expect(op(queries.find(isFts)!, "textSearch")?.[1]).toBe("\"chest pain acute\"")
  })

  it("falls back to an escaped ILIKE search when full-text search fails", async () => {
    respond = (query) => isFts(query)
      ? { data: null, error: { message: "syntax error" } }
      : { data: [docs.migraine], error: null }

    const response = await searchWorkspaceDocuments("ws-1", { query: "50%_off", mode: "keyword" }, { allowConceptual: false })

    expect(response.results.map((result) => result.id)).toEqual(["doc-2"])
    expect(op(queries.at(-1)!, "or")).toEqual(["name.ilike.%50\\%\\_off%,content.ilike.%50\\%\\_off%"])
  })

  it("throws a 500 when the fallback search fails too", async () => {
    respond = () => ({ data: null, error: { message: "down" } })

    await expect(searchWorkspaceDocuments("ws-1", { query: "aspirin", mode: "keyword" }, { allowConceptual: false }))
      .rejects.toThrow("Failed to search documents")
  })
})

describe("conceptual search", () => {
  beforeEach(() => {
    vi.mocked(getWorkspaceModelRow).mockResolvedValue({} as never)
  })

  it("expands the query, retrieves candidates and keeps the ones the model judges a match", async () => {
    respond = (query) => ({ data: isFts(query) ? [docs.aspirin, docs.migraine] : [], error: null })
    vi.mocked(completeJson)
      .mockResolvedValueOnce({ keywords: ["aspirin", " ", "migraine", "x"], criteria: "Mentions a painkiller" })
      .mockResolvedValueOnce({
        results: [
          { id: "doc-1", match: true, reason: "Mentions aspirin", snippet: "took [aspirin]" },
          { id: "doc-2", match: false, reason: "", snippet: "" },
          { id: "doc-unknown", match: true },
        ],
      })

    const response = await searchWorkspaceDocuments("ws-1", { query: "painkillers" }, { allowConceptual: true })

    expect(response).toEqual({
      mode: "conceptual",
      modelConfigured: true,
      results: [{ id: "doc-1", name: "aspirin.txt", snippet: highlight("took aspirin"), reason: "Mentions aspirin" }],
    })
    expect(op(queries.find(isFts)!, "textSearch")?.[1]).toBe("aspirin OR migraine")
    expect(vi.mocked(completeJson).mock.calls[1][0].prompt).toContain("Mentions a painkiller")
  })

  it("judges candidates in batches", async () => {
    const rows = Array.from({ length: SEARCH_JUDGE_BATCH_SIZE + 1 }, (_, index) => ({
      id: `doc-${index}`,
      name: `${index}.txt`,
      content: "aspirin",
    }))
    respond = (query) => ({ data: isFts(query) ? rows : [], error: null })
    vi.mocked(completeJson).mockImplementation(async ({ prompt }) => (
      prompt.includes("doc-0")
        ? { results: [{ id: "doc-0", match: true, reason: "", snippet: "" }] }
        : { results: [{ id: `doc-${SEARCH_JUDGE_BATCH_SIZE}`, match: true, reason: "", snippet: "" }] }
    ))
    vi.mocked(completeJson).mockResolvedValueOnce({ keywords: ["aspirin"] })

    const response = await searchWorkspaceDocuments("ws-1", { query: "aspirin" }, { allowConceptual: true })

    expect(completeJson).toHaveBeenCalledTimes(3)
    expect(response.results.map((result) => [result.id, result.snippet, result.reason])).toEqual([
      ["doc-0", highlight("aspirin"), null],
      [`doc-${SEARCH_JUDGE_BATCH_SIZE}`, highlight("aspirin"), null],
    ])
  })

  it("retries retrieval with the raw query when the expanded keywords find nothing", async () => {
    respond = (query) => ({
      data: isFts(query) && op(query, "textSearch")?.[1] === "painkillers" ? [docs.aspirin] : [],
      error: null,
    })
    vi.mocked(completeJson)
      .mockResolvedValueOnce({ keywords: ["analgesic"] })
      .mockResolvedValueOnce({ results: [] })

    const response = await searchWorkspaceDocuments("ws-1", { query: "painkillers" }, { allowConceptual: true })

    expect(queries.filter(isFts).map((query) => op(query, "textSearch")?.[1])).toEqual(["analgesic", "painkillers"])
    expect(response).toEqual({ mode: "conceptual", modelConfigured: true, results: [] })
  })

  it("uses keyword search when the workspace has no model", async () => {
    vi.mocked(getWorkspaceModelRow).mockResolvedValue(null)

    const response = await searchWorkspaceDocuments("ws-1", { query: "aspirin" }, { allowConceptual: true })

    expect(response).toEqual({ mode: "keyword", modelConfigured: false, results: [] })
    expect(completeJson).not.toHaveBeenCalled()
  })

  it("does not consult the model for readers who are not members", async () => {
    const response = await searchWorkspaceDocuments("ws-1", { query: "aspirin" }, { allowConceptual: false })

    expect(getWorkspaceModelRow).not.toHaveBeenCalled()
    expect(response.mode).toBe("keyword")
  })

  it.each([
    ["credentials cannot be loaded", () => {
      vi.mocked(getWorkspaceModelCredentials).mockRejectedValueOnce(new Error("bad key"))
    }],
    ["query expansion fails", () => {
      vi.mocked(completeJson).mockRejectedValueOnce(new Error("model down"))
    }],
    ["judging fails", () => {
      vi.mocked(completeJson)
        .mockResolvedValueOnce({ keywords: ["aspirin"] })
        .mockRejectedValueOnce(new Error("timeout"))
    }],
  ])("falls back to keyword search when %s", async (_label, arrange) => {
    respond = (query) => ({ data: isFts(query) ? [docs.aspirin] : [], error: null })
    arrange()

    const response = await searchWorkspaceDocuments("ws-1", { query: "aspirin" }, { allowConceptual: true })

    expect(response).toMatchObject({ mode: "keyword", modelConfigured: true, modelFailed: true })
    expect(response.results.map((result) => result.id)).toEqual(["doc-1"])
  })
})

describe("structured search", () => {
  const content = "Took aspirin 10mg."
  const annotations = Array.from({ length: 25 }, (_, index) => ({
    id: `ann-${index}`,
    entity: "Drug",
    text: "aspirin",
    start: 5,
    end: 12,
    attributes: {},
  }))

  it("compiles the query, calls the RPC and highlights the first matched annotation", async () => {
    vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce({
      data: [{ id: "doc-1", name: "a.txt", content, match_count: "25", annotations }],
      error: null,
    } as never)

    const response = await searchWorkspaceDocuments(
      "ws-1",
      { query: "{\"entity\": \"Drug\"}", mode: "structured" },
      { allowConceptual: true },
    )

    expect(supabaseAdmin.rpc).toHaveBeenCalledWith("search_workspace_annotations", {
      p_workspace_id: "ws-1",
      p_all: ["$ ? (@.entity == \"Drug\")"],
      p_none: [],
      p_limit: expect.any(Number),
    })
    expect(getWorkspaceModelRow).not.toHaveBeenCalled()
    expect(response.mode).toBe("structured")
    expect(response.results).toHaveLength(1)
    expect(response.results[0]).toMatchObject({
      id: "doc-1",
      snippet: `Took ${highlight("aspirin")} 10mg.`,
      matchCount: 25,
      reason: null,
    })
    expect(response.results[0].annotations).toHaveLength(20)
  })

  it("falls back to the start of the document when the annotation offsets are out of range", async () => {
    vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce({
      data: [{ id: "doc-1", name: "a.txt", content, match_count: 1, annotations: [{ ...annotations[0], end: 99 }] }],
      error: null,
    } as never)

    const response = await searchWorkspaceDocuments("ws-1", { query: "{\"entity\": \"Drug\"}", mode: "structured" }, { allowConceptual: false })

    expect(response.results[0].snippet).toBe(content)
  })

  it.each([
    [{ code: "2201B", message: "invalid regular expression" }, 400, "Invalid query: invalid regular expression"],
    [{ code: "57014", message: "timeout" }, 500, "Failed to search annotations"],
  ])("maps RPC error %j to a %i", async (error, status, message) => {
    vi.mocked(supabaseAdmin.rpc).mockResolvedValueOnce({ data: null, error } as never)

    const caught = await searchWorkspaceDocuments(
      "ws-1",
      { query: "{\"text\": {\"$regex\": \"(\"}}", mode: "structured" },
      { allowConceptual: false },
    ).catch((thrown: unknown) => thrown)

    expect(caught).toBeInstanceOf(HTTPException)
    expect((caught as HTTPException).status).toBe(status)
    expect((caught as HTTPException).message).toBe(message)
  })

  it("rejects invalid queries before calling the database", async () => {
    await expect(searchWorkspaceDocuments("ws-1", { query: "{", mode: "structured" }, { allowConceptual: false }))
      .rejects.toThrow("Query must be valid JSON")
    expect(supabaseAdmin.rpc).not.toHaveBeenCalled()
  })
})
