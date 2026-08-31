import { HTTPException } from "hono/http-exception"

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim()
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")

  try {
    return JSON.parse(unfenced)
  } catch {
    throw new HTTPException(502, { message: "The workspace model returned invalid JSON" })
  }
}

interface CompleteArgs {
  baseUrl: string
  apiKey: string
  model: string
  prompt: string
  timeoutMs?: number
}

export async function completeJson(args: CompleteArgs): Promise<unknown> {
  const url = `${args.baseUrl.replace(/\/$/, "")}/chat/completions`
  const messages = [
    {
      role: "system",
      content: "You are a JSON API. Respond with valid JSON only. Do not include markdown or commentary.",
    },
    {
      role: "user",
      content: args.prompt,
    },
  ]

  let useJsonFormat = true
  let useTemperature = !/anthropic\.com/i.test(args.baseUrl) && !/^claude/i.test(args.model)
  let lastStatus = 0
  let lastBody = ""

  while (true) {
    let response: Response

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (args.apiKey) {
        headers.Authorization = `Bearer ${args.apiKey}`
      }

      const body: Record<string, unknown> = {
        messages,
      }

      if (useTemperature) {
        body.temperature = 0
      }

      if (useJsonFormat) {
        body.response_format = { type: "json_object" }
      }

      if (args.model) {
        body.model = args.model
      }

      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(args.timeoutMs ?? 45_000),
      })
    } catch (error) {
      console.error("Workspace model request failed", error)
      throw new HTTPException(502, { message: "The workspace model could not be reached" })
    }

    if (response.ok) {
      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const content = payload.choices?.[0]?.message?.content

      if (typeof content !== "string" || content.trim() === "") {
        throw new HTTPException(502, { message: "The workspace model returned an empty suggestion" })
      }

      return parseJsonContent(content)
    }

    lastStatus = response.status
    lastBody = await response.text()

    if (response.status !== 400) {
      break
    }

    if (useTemperature && /temperature/i.test(lastBody)) {
      useTemperature = false
      continue
    }

    if (useJsonFormat) {
      useJsonFormat = false
      continue
    }

    break
  }

  console.error("Workspace model error", lastStatus, lastBody.slice(0, 2000))
  throw new HTTPException(502, { message: "The workspace model failed to produce a suggestion" })
}
