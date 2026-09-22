import { Button, Grid, Group, Modal, PasswordInput, Select, Text, TextInput, type SelectProps } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useEffect, useState } from "react"
import { ProviderLogo } from "components/icons/ProviderLogos"
import { Workspace } from "storage/database"
import {
  DEFAULT_PROVIDER_ID,
  ProviderId,
  getProvider,
  isCustomProvider,
  matchPreset,
  modelSelectData,
  providerSelectData,
  resolvePreset,
} from "utils/ModelPresets"
import notify from "utils/Notifications"
import { getWorkspaceModel, saveWorkspaceModel } from "utils/WorkspaceModel"

interface ConfigureAiForm {
  providerId: string
  modelId: string
  baseUrl: string
  model: string
  apiKey: string
}

const renderProviderOption: SelectProps["renderOption"] = ({ option }) => (
  <Group gap={8} wrap="nowrap">
    <ProviderLogo providerId={option.value} />
    <span>{option.label}</span>
  </Group>
)

function defaultForm(): ConfigureAiForm {
  return {
    providerId: DEFAULT_PROVIDER_ID,
    modelId: getProvider(DEFAULT_PROVIDER_ID)?.defaultModelId ?? "",
    baseUrl: "",
    model: "",
    apiKey: "",
  }
}

function ConfigureAiModal({
  workspace,
  openedModal,
  setOpenedModal,
}: {
  workspace: Workspace
  openedModal: boolean
  setOpenedModal: (opened: boolean) => void
}) {
  const [apiKeyLast4, setApiKeyLast4] = useState<string | null>(null)
  const [savedProviderId, setSavedProviderId] = useState<string | null>(null)
  const [savedBaseUrl, setSavedBaseUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<ConfigureAiForm>({
    initialValues: defaultForm(),
  })

  const custom = isCustomProvider(form.values.providerId)
  const provider = getProvider(form.values.providerId)

  useEffect(() => {
    if (!openedModal) {
      return
    }

    form.setValues(defaultForm())
    setApiKeyLast4(null)
    setSavedProviderId(null)
    setSavedBaseUrl(null)

    getWorkspaceModel(workspace.id)
      .then((model) => {
        setApiKeyLast4(model.apiKeyLast4)

        if (!model.configured) {
          setSavedProviderId(null)
          form.setValues(defaultForm())
          return
        }

        const matched = matchPreset(model.baseUrl, model.model)
        setSavedProviderId(matched.providerId)
        setSavedBaseUrl(model.baseUrl)

        if (isCustomProvider(matched.providerId)) {
          form.setValues({
            providerId: ProviderId.Custom,
            modelId: "",
            baseUrl: model.baseUrl,
            model: model.model,
            apiKey: "",
          })
          return
        }

        form.setValues({
          providerId: matched.providerId,
          modelId: matched.modelId,
          baseUrl: model.baseUrl,
          model: model.model,
          apiKey: "",
        })
      })
      .catch((e) => notify.error("Failed to load workspace model.", e))
    // form is not a stable dep from useForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedModal, workspace.id])

  const handleProviderChange = (next: string | null) => {
    if (!next) {
      return
    }

    if (isCustomProvider(next)) {
      const resolved = resolvePreset(form.values.providerId, form.values.modelId)

      form.setValues({
        ...form.values,
        providerId: next,
        modelId: "",
        baseUrl: resolved?.baseUrl ?? form.values.baseUrl,
        model: resolved?.model ?? form.values.model,
        apiKey: form.values.apiKey,
      })
      return
    }

    const nextProvider = getProvider(next)

    if (!nextProvider) {
      return
    }

    form.setValues({
      ...form.values,
      providerId: next,
      modelId: nextProvider.defaultModelId,
    })
  }

  const handleSaveModel = async (values: ConfigureAiForm) => {
    form.clearErrors()

    if (isCustomProvider(values.providerId)) {
      const baseUrl = values.baseUrl.trim()

      if (baseUrl === "") {
        form.setFieldError("baseUrl", "Enter a base URL")
        return
      }

      const baseUrlChanged = savedBaseUrl !== null && savedBaseUrl !== baseUrl.replace(/\/$/, "")

      if (values.apiKey.trim() === "" && apiKeyLast4 && baseUrlChanged) {
        form.setFieldError("apiKey", "Enter the API key again when changing the base URL")
        return
      }

      setSaving(true)

      try {
        await saveWorkspaceModel(workspace.id, {
          baseUrl,
          model: values.model.trim(),
          apiKey: values.apiKey || undefined,
        })

        notify.success("AI model saved.")
        setOpenedModal(false)
      } catch (e) {
        notify.error("Failed to save AI model.", e instanceof Error ? e : undefined)
      } finally {
        setSaving(false)
      }

      return
    }

    const resolved = resolvePreset(values.providerId, values.modelId)

    if (!resolved) {
      form.setFieldError("modelId", "Select a model")
      return
    }

    const providerChanged = savedProviderId !== null && savedProviderId !== values.providerId

    if (values.apiKey.trim() === "" && (!apiKeyLast4 || providerChanged)) {
      form.setFieldError("apiKey", "Enter an API key")
      return
    }

    setSaving(true)

    try {
      await saveWorkspaceModel(workspace.id, {
        baseUrl: resolved.baseUrl,
        model: resolved.model,
        apiKey: values.apiKey || undefined,
      })

      notify.success("AI model saved.")
      setOpenedModal(false)
    } catch (e) {
      notify.error("Failed to save AI model.", e instanceof Error ? e : undefined)
    } finally {
      setSaving(false)
    }
  }

  const providerChanged = savedProviderId !== null && savedProviderId !== form.values.providerId
  const keepSavedKey = Boolean(apiKeyLast4) && !providerChanged
  const apiKeyPlaceholder = keepSavedKey
    ? `Saved key ending in ${apiKeyLast4}`
    : custom
      ? "optional"
      : provider?.apiKeyPlaceholder ?? "sk-..."

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Configure AI"
      centered
    >
      <form onSubmit={form.onSubmit((values) => handleSaveModel(values))}>
        <Grid>
          <Grid.Col span={12}>
            <Text size="xs" c="dimmed">
              {custom
                ? "Point this workspace at a local or OpenAI-compatible server. Model name and API key are optional if your server ignores them."
                : "Presets use the official Claude and OpenAI APIs for suggestions in this workspace. Choose Custom for a local or OpenAI-compatible server."}
            </Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <Select
              label="Provider"
              data={providerSelectData()}
              allowDeselect={false}
              value={form.values.providerId}
              onChange={handleProviderChange}
              leftSection={<ProviderLogo providerId={form.values.providerId} />}
              leftSectionPointerEvents="none"
              renderOption={renderProviderOption}
            />
          </Grid.Col>

          {!custom && (
            <Grid.Col span={12}>
              <Select
                label="Model"
                data={modelSelectData(form.values.providerId)}
                allowDeselect={false}
                {...form.getInputProps("modelId")}
              />
            </Grid.Col>
          )}

          {custom && (
            <>
              <Grid.Col span={12}>
                <TextInput
                  label="Base URL"
                  placeholder="http://127.0.0.1:11434/v1"
                  {...form.getInputProps("baseUrl")}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Model"
                  placeholder="optional if your server ignores it"
                  {...form.getInputProps("model")}
                />
              </Grid.Col>
            </>
          )}

          <Grid.Col span={12}>
            <PasswordInput
              label="API key"
              placeholder={apiKeyPlaceholder}
              description={
                keepSavedKey
                  ? "Leave blank to keep the saved key."
                  : custom
                    ? undefined
                    : "Stored encrypted for this workspace."
              }
              {...form.getInputProps("apiKey")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  )
}

export default ConfigureAiModal
