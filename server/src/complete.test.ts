import { HTTPException } from "hono/http-exception"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { completeJson } from "./complete.js"

const fetchMock = vi.fn<typeof fetch>()

function chatResponse(content: string): Response {
  return Response.json({ choices: [{ message: { content } }] })
}

function requestBody(call: number): Record<string, unknown> {
  return JSON.parse(fetchMock.mock.calls[call][1]!.body as string)
}

const args = { baseUrl: "https://api.openai.com/v1/", apiKey: "key", model: "gpt", prompt: "prompt" }

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe("completeJson", () => {
  it("posts a chat completion request and parses the JSON reply", async () => {
    fetchMock.mockResolvedValueOnce(chatResponse("{\"entity\": \"Drug\"}"))

    await expect(completeJson(args)).resolves.toEqual({ entity: "Drug" })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.openai.com/v1/chat/completions")
    expect(init?.headers).toEqual({ "Content-Type": "application/json", Authorization: "Bearer key" })
    expect(requestBody(0)).toMatchObject({
      model: "gpt",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "system" }, { role: "user", content: "prompt" }],
    })
  })

  it("omits the key, model and temperature when they do not apply", async () => {
    fetchMock.mockResolvedValueOnce(chatResponse("{}"))

    await completeJson({ ...args, baseUrl: "https://api.anthropic.com/v1", apiKey: "", model: "" })

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ "Content-Type": "application/json" })
    expect(requestBody(0)).not.toHaveProperty("model")
    expect(requestBody(0)).not.toHaveProperty("temperature")
  })

  it("unwraps fenced JSON", async () => {
    fetchMock.mockResolvedValueOnce(chatResponse("```json\n{\"a\": 1}\n```"))

    await expect(completeJson(args)).resolves.toEqual({ a: 1 })
  })

  it("retries without temperature, then without response_format, on 400s", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("temperature is not supported", { status: 400 }))
      .mockResolvedValueOnce(new Response("response_format is not supported", { status: 400 }))
      .mockResolvedValueOnce(chatResponse("{\"ok\": true}"))

    await expect(completeJson(args)).resolves.toEqual({ ok: true })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(requestBody(1)).not.toHaveProperty("temperature")
    expect(requestBody(1)).toHaveProperty("response_format")
    expect(requestBody(2)).not.toHaveProperty("response_format")
  })

  it.each([
    ["a non-400 error", () => new Response("boom", { status: 500 }), "failed to produce a suggestion"],
    ["an empty reply", () => chatResponse("  "), "returned an empty suggestion"],
    ["invalid JSON", () => chatResponse("not json"), "returned invalid JSON"],
  ])("throws a 502 on %s", async (_label, response, message) => {
    fetchMock.mockResolvedValue(response())

    const error = await completeJson(args).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(HTTPException)
    expect((error as HTTPException).status).toBe(502)
    expect((error as HTTPException).message).toContain(message)
  })

  it("gives up after repeated 400s", async () => {
    fetchMock.mockImplementation(async () => new Response("bad request", { status: 400 }))

    await expect(completeJson(args)).rejects.toThrow("failed to produce a suggestion")
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("throws a 502 when the model cannot be reached", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"))

    await expect(completeJson(args)).rejects.toThrow("could not be reached")
  })
})
