export const CUSTOM_PROVIDER_ID = "custom"
export const DEFAULT_PROVIDER_ID = "anthropic"

export interface ModelOption {
  id: string
  label: string
}

export interface ProviderPreset {
  id: string
  label: string
  baseUrl: string
  defaultModelId: string
  apiKeyPlaceholder: string
  models: ModelOption[]
}

export const MODEL_PROVIDERS: ProviderPreset[] = [
  {
    id: "anthropic",
    label: "Claude",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModelId: "claude-sonnet-5",
    apiKeyPlaceholder: "sk-ant-...",
    models: [
      { id: "claude-fable-5", label: "Fable 5" },
      { id: "claude-opus-5", label: "Opus 5" },
      { id: "claude-sonnet-5", label: "Sonnet 5" },
      { id: "claude-haiku-4-5", label: "Haiku 4.5" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModelId: "gpt-5.6-sol",
    apiKeyPlaceholder: "sk-...",
    models: [
      { id: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
      { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
      { id: "gpt-5.6-luna", label: "GPT-5.6 Luna" },
    ],
  },
]

export interface MatchedPreset {
  providerId: string
  modelId: string
}

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "")
}

export function getProvider(providerId: string): ProviderPreset | undefined {
  return MODEL_PROVIDERS.find((provider) => provider.id === providerId)
}

export function isCustomProvider(providerId: string): boolean {
  return providerId === CUSTOM_PROVIDER_ID
}

export function providerSelectData(): { value: string, label: string }[] {
  return [
    ...MODEL_PROVIDERS.map((provider) => ({
      value: provider.id,
      label: provider.label,
    })),
    { value: CUSTOM_PROVIDER_ID, label: "Custom" },
  ]
}

export function modelSelectData(providerId: string): { value: string, label: string }[] {
  return getProvider(providerId)?.models.map((model) => ({
    value: model.id,
    label: model.label,
  })) ?? []
}

export function matchPreset(baseUrl: string, model: string): MatchedPreset {
  const url = normalizeBaseUrl(baseUrl)
  const modelId = model.trim()

  for (const provider of MODEL_PROVIDERS) {
    if (normalizeBaseUrl(provider.baseUrl) !== url) {
      continue
    }

    if (provider.models.some((option) => option.id === modelId)) {
      return {
        providerId: provider.id,
        modelId,
      }
    }
  }

  return {
    providerId: CUSTOM_PROVIDER_ID,
    modelId: "",
  }
}

export function resolvePreset(providerId: string, modelId: string): { baseUrl: string, model: string } | null {
  const provider = getProvider(providerId)

  if (!provider) {
    return null
  }

  const model = provider.models.find((option) => option.id === modelId)

  if (!model) {
    return null
  }

  return {
    baseUrl: provider.baseUrl,
    model: model.id,
  }
}
