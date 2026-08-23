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

  const attempts: Array<Record<string, unknown>> = [
    { response_format: { type: "json_object" } },
    {},
  ]

  let lastStatus = 0
  let lastBody = ""

  for (const extra of attempts) {
    let response: Response

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${args.apiKey}`,
        },
        body: JSON.stringify({
          model: args.model,
          temperature: 0,
          messages,
          ...extra,
        }),
        signal: AbortSignal.timeout(45_000),
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
  }

  console.error("Workspace model error", lastStatus, lastBody.slice(0, 2000))
  throw new HTTPException(502, { message: "The workspace model failed to produce a suggestion" })
}
