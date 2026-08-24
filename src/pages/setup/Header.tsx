import { ActionIcon, Group, Button, Text, Grid, Modal, TextInput, PasswordInput, Tooltip } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconArrowRight, IconCornerDownLeft, IconPencil, IconSparkles } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Workspace, database } from "storage/database"
import { moveToPage } from "utils/Location"
import notify from "utils/Notifications"
import { Path, toAnnotateUrl } from "utils/Path"
import { getWorkspaceModel, saveWorkspaceModel } from "utils/WorkspaceModel"
import { SectionProps } from "./Setup"

interface HeaderProps extends SectionProps {
  onWorkspaceChange: (workspace: Workspace) => void
}

function Header({ workspace, workspaceStatus, onWorkspaceChange }: HeaderProps) {
  const { id } = useParams()

  const [openedConfigureAiModal, setOpenedConfigureAiModal] = useState(false)
  const workspaceRef = useRef(workspace)
  workspaceRef.current = workspace

  const saveMetadata = async (name: string, description: string) => {
    const previous = workspaceRef.current
    const next = {
      ...previous,
      name,
      description,
    }

    workspaceRef.current = next
    onWorkspaceChange(next)

    try {
      await database.updateWorkspace(next.id, next.name, next.description || "")
    } catch (e) {
      workspaceRef.current = previous
      onWorkspaceChange(previous)
      notify.error("Failed to update workspace.", e instanceof Error ? e : undefined)
      throw e
    }
  }

  if (id === undefined) {
    return <></>
  }

  return (
    <>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
          <InlineEditableText
            value={workspace.name}
            placeholder="Add a title..."
            editLabel="Edit name"
            required
            fz={25}
            fw={700}
            onSave={(name) => saveMetadata(name, workspaceRef.current.description || "")}
          />

          <InlineEditableText
            value={workspace.description || ""}
            placeholder="Add a description..."
            editLabel="Edit description"
            fz={14}
            c="dimmed"
            onSave={(description) => saveMetadata(workspaceRef.current.name, description)}
          />
        </div>

        <Group wrap="nowrap">
          <Button
            variant="subtle"
            onClick={() => moveToPage(Path.Dashboard)}
          >
            Exit setup
          </Button>

          <Button
            variant="subtle"
            leftSection={<IconSparkles size={16} />}
            onClick={() => setOpenedConfigureAiModal(true)}
          >
            Configure AI
          </Button>

          <Button
            disabled={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument}
            onClick={() => moveToPage(toAnnotateUrl(id))}
            variant="light"
            bg={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument ? "gray" : "green"}
            c={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument ? "darkgray" : "darkgreen"}
          >
            Annotate <IconArrowRight size={19} />
          </Button>
        </Group>
      </Group>

      <ConfigureAiModal
        workspace={workspace}
        openedModal={openedConfigureAiModal}
        setOpenedModal={setOpenedConfigureAiModal}
      />
    </>
  )
}

function InlineEditableText({
  value,
  placeholder,
  editLabel,
  required,
  fz,
  fw,
  c,
  onSave,
}: {
  value: string
  placeholder?: string
  editLabel: string
  required?: boolean
  fz: number
  fw?: number
  c?: string
  onSave: (next: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) {
      setDraft(value)
    }
  }, [editing, value])

  const startEditing = () => {
    setDraft(value)
    setEditing(true)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  const save = async () => {
    const trimmed = draft.trim()

    if (required && trimmed === "") {
      return
    }

    if (trimmed === value.trim()) {
      setEditing(false)
      setDraft(value)
      return
    }

    setSaving(true)

    try {
      await onSave(trimmed)
      setEditing(false)
    } catch {
      // Keep the draft so the user can retry or cancel.
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        style={{ marginBottom: 4 }}
      >
        <Group gap="xs" wrap="nowrap" align="center">
          <TextInput
            style={{ flex: 1, minWidth: 0 }}
            value={draft}
            placeholder={placeholder}
            autoFocus
            disabled={saving}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault()
                cancel()
              }
            }}
          />

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={saving}
            onClick={cancel}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            color="green"
            size="sm"
            loading={saving}
            disabled={required && draft.trim() === ""}
            rightSection={<IconCornerDownLeft size={14} />}
          >
            Save
          </Button>
        </Group>
      </form>
    )
  }

  return (
    <Group gap={6} wrap="nowrap" align="center">
      <Text
        fz={fz}
        fw={fw}
        c={value ? c : "dimmed"}
        style={{ cursor: "pointer", minWidth: 0 }}
        lineClamp={2}
        onClick={startEditing}
      >
        {value || placeholder}
      </Text>

      <Tooltip label={editLabel}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          aria-label={editLabel}
          onClick={startEditing}
        >
          <IconPencil size={15} />
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}

interface ConfigureAiForm {
  baseUrl: string
  model: string
  apiKey: string
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
  const [modelConfigured, setModelConfigured] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues: {
      baseUrl: "https://api.openai.com/v1",
      model: "",
      apiKey: "",
    },
  })

  useEffect(() => {
    if (!openedModal) {
      return
    }

    form.setValues({
      baseUrl: "https://api.openai.com/v1",
      model: "",
      apiKey: "",
    })

    getWorkspaceModel(workspace.id)
      .then((model) => {
        setApiKeyLast4(model.apiKeyLast4)
        setModelConfigured(model.configured)
        form.setValues({
          baseUrl: model.baseUrl,
          model: model.model,
          apiKey: "",
        })
      })
      .catch((e) => notify.error("Failed to load workspace model.", e))
    // form is not a stable dep from useForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedModal, workspace.id])

  const handleSaveModel = async (values: ConfigureAiForm) => {
    const { baseUrl, model, apiKey } = values
    const defaultBaseUrl = "https://api.openai.com/v1"
    const normalizedBaseUrl = baseUrl.trim().replace(/\/$/, "")
    const hasCustomEndpoint = normalizedBaseUrl !== "" && normalizedBaseUrl !== defaultBaseUrl
    const shouldSaveModel = modelConfigured
      || apiKey.trim() !== ""
      || model.trim() !== ""
      || hasCustomEndpoint

    if (!shouldSaveModel) {
      setOpenedModal(false)
      return
    }

    setSaving(true)

    try {
      await saveWorkspaceModel(workspace.id, {
        baseUrl,
        model,
        apiKey: apiKey || undefined,
      })

      notify.success("AI model saved.")
      setOpenedModal(false)
    } catch (e) {
      notify.error("Failed to save AI model.", e instanceof Error ? e : undefined)
    } finally {
      setSaving(false)
    }
  }

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
              OpenAI-compatible Chat Completions endpoint used for suggestions in this workspace.
              Model name and API key are optional if your server ignores them.
            </Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Base URL"
              placeholder="https://api.openai.com/v1"
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

          <Grid.Col span={12}>
            <PasswordInput
              label="API key"
              placeholder={apiKeyLast4 ? `Saved key ending in ${apiKeyLast4}` : "sk-..."}
              description={apiKeyLast4 ? "Leave blank to keep the saved key." : undefined}
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

export default Header
