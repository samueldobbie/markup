# Markup Annotation Tool for ML and NLP

![](https://markup-storage.s3.eu-west-2.amazonaws.com/annotate-dark-v2.png)

Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition. Markup learns as you annotate to predict and suggest complex annotations, and also provides integrated access to common and custom ontologies for concept mapping.

# Key Features

- **Predictive annotation** - Markup's machine learning-powered predictive annotation feature suggests complex annotations as you work, making the process of annotating documents more efficient and saving you valuable time.

- **Integrated ontology access** Markup provides integrated access to a wide range of common ontologies (e.g. UMLS, SNOMED-CT, ICD-10), as well as the ability to upload custom ontologies, for concept mapping.

- **Predictive ontology mapping** - Markup's predictive ontology mapping feature uses machine learning to suggest appropriate mappings to standard and custom terminologies based on the text you're annotating.

- **User-friendly interface** - Whether you're a technical expert or a beginner, Markup's user-friendly interface makes it easy for anyone to start annotating documents with minimal setup.

# Installation

To install and run Markup locally:

1. Clone the repository and install dependencies: `git clone https://github.com/samueldobbie/markup && cd markup && pnpm install`
1. Copy `.env.example` to `.env.local`
1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
1. Start Supabase: `supabase start`. This will output an API URL, anon key, and service role key. Add the URL and anon key to `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and the service role key as `SUPABASE_SERVICE_ROLE_KEY`. Set `MODEL_CREDENTIALS_KEY` to any secret used to encrypt workspace API keys (or a 64-character hex key).
1. Run the web app and API: `pnpm dev` and `pnpm dev:api`
1. Open Markup in your web browser at `http://localhost:3000`

To use AI suggestions, open a workspace, click **Settings**, and add an OpenAI-compatible base URL. Model name and API key are optional. Highlighting text in the annotate view will suggest an entity and attributes. The **Suggested** tab asks the same model for document-level annotations you can accept or dismiss.

# Custom AI endpoints

Markup does not call a Markup-hosted model. Each workspace points at **your** HTTP API. That API must speak the OpenAI Chat Completions protocol.

Markup sends:

```
POST {base URL}/chat/completions
Content-Type: application/json
Authorization: Bearer {API key}   # omitted if you leave the API key blank
```

Do not include `/chat/completions` in the base URL. These are equivalent:

| Base URL | Request URL |
|---|---|
| `https://api.openai.com/v1` | `https://api.openai.com/v1/chat/completions` |
| `http://127.0.0.1:8080` | `http://127.0.0.1:8080/chat/completions` |

Request body:

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0,
  "messages": [
    { "role": "system", "content": "You are a JSON API. Respond with valid JSON only. ..." },
    { "role": "user", "content": "<suggestion prompt>" }
  ]
}
```

`model` is omitted when the workspace model name is blank. Your server can ignore `model` if it only serves one model.

Markup first tries `response_format: { "type": "json_object" }`. If that returns HTTP 400, it retries without `response_format`. Either way, the assistant message must be JSON (optionally wrapped in a ` ```json ` fence).

Expected response:

```json
{
  "choices": [
    {
      "message": {
        "content": "{\"entity\": \"Prescription\"}"
      }
    }
  ]
}
```

Entity suggestions parse `{"entity": "<name>"}`. Attribute suggestions parse a flat object of string values, for example `{"Dose": "10", "Unit": "mg"}`. Document-level suggestions parse `{"annotations":[{"entity":"<name>","text_span":"<exact substring>","attributes":{}}]}`. Markup resolves `text_span` against the document and drops anything not in the workspace config, not present in the span, or overlapping an existing annotation.

Examples:

| Provider | Base URL | Model | API key |
|---|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | `sk-...` |
| Anthropic (OpenAI-compatible) | `https://api.anthropic.com/v1` | `claude-haiku-4-5` | `sk-ant-...` |
| Ollama | `http://127.0.0.1:11434/v1` | `llama3.2` | blank or any placeholder |
| Single-model proxy | `https://your-proxy.example` | blank | blank, or Bearer token if you require auth |

A local or private endpoint with no model name and no key is valid: set only the base URL.

# Deploy

The Fly.io app serves the API and the built frontend from the same process. Set these secrets on the machine:

```
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... MODEL_CREDENTIALS_KEY=...
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are baked in at image build time, so pass them as build arguments:

```
fly deploy --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_ANON_KEY=...
```

# Usage

To get started with Markup, read the [quick start guide](https://getmarkup.com/docs).

# Contributions

Contributions to Markup are appreciated. If you'd like to contribute, please follow these guidelines:

1. Fork the repository
1. Create a new branch for your feature
1. Make your changes
1. Submit a pull request for review

# Support

If you have any questions or need assistance with Markup, you can contact me at [sam@getmarkup.com](mailto:sam@getmarkup.com).
