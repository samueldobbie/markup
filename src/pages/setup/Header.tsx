import { Group, Button, Text, Grid, Modal, TextInput, PasswordInput, Divider } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconArrowRight } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Workspace, database } from "storage/database"
import { moveToPage } from "utils/Location"
import notify from "utils/Notifications"
import { Path, toAnnotateUrl } from "utils/Path"
import { getWorkspaceModel, saveWorkspaceModel } from "utils/WorkspaceModel"
import { SectionProps } from "./Setup"

function Header({ workspace, workspaceStatus }: SectionProps) {
  const { id } = useParams()

  const [openedEditWorkspaceModal, setOpenedEditWorkspaceModal] = useState(false)

  if (id === undefined) {
    return <></>
  }

  return (
    <>
      <Group justify="space-between">
        <Group justify="flex-start">
          <div>
            <Text fz={25} style={{ fontWeight: "bold" }}>
              {workspace.name}
            </Text>

            <Text c="dimmed" fz={14}>
              {workspace.description || "No description"}
            </Text>
          </div>
        </Group>

        <Group>
          <Button
            variant="subtle"
            onClick={() => moveToPage(Path.Dashboard)}
          >
            Exit setup
          </Button>

          <Button
            variant="subtle"
            onClick={() => setOpenedEditWorkspaceModal(true)}
          >
            Settings
          </Button>

          <Button
            disabled={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument}
            onClick={() => moveToPage(toAnnotateUrl(id))}
            variant="light"
            bg="green"
            c="darkgreen"
          >
            Annotate <IconArrowRight size={19} />
          </Button>
        </Group>
      </Group>

      <EditWorkspaceModal
        workspace={workspace}
        openedModal={openedEditWorkspaceModal}
        setOpenedModal={setOpenedEditWorkspaceModal}
      />
    </>
  )
}

interface UpdateWorkspaceForm {
  name: string
  description?: string
  baseUrl: string
  model: string
  apiKey: string
}

function EditWorkspaceModal({
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
      name: workspace.name,
      description: workspace.description,
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
      name: workspace.name,
      description: workspace.description,
      baseUrl: "https://api.openai.com/v1",
      model: "",
      apiKey: "",
    })

    getWorkspaceModel(workspace.id)
      .then((model) => {
        setApiKeyLast4(model.apiKeyLast4)
        setModelConfigured(model.configured)
        form.setValues({
          name: workspace.name,
          description: workspace.description,
          baseUrl: model.baseUrl,
          model: model.model,
          apiKey: "",
        })
      })
      .catch((e) => notify.error("Failed to load workspace model.", e))
    // form is not a stable dep from useForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedModal, workspace.description, workspace.id, workspace.name])

  const handleUpdateWorkspace = async (values: UpdateWorkspaceForm) => {
    const { name, description, baseUrl, model, apiKey } = values
    const defaultBaseUrl = "https://api.openai.com/v1"
    const normalizedBaseUrl = baseUrl.trim().replace(/\/$/, "")
    const hasCustomEndpoint = normalizedBaseUrl !== "" && normalizedBaseUrl !== defaultBaseUrl
    const shouldSaveModel = modelConfigured
      || apiKey.trim() !== ""
      || model.trim() !== ""
      || hasCustomEndpoint

    setSaving(true)

    try {
      await database.updateWorkspace(workspace.id, name, description || "")

      if (shouldSaveModel) {
        await saveWorkspaceModel(workspace.id, {
          baseUrl,
          model,
          apiKey: apiKey || undefined,
        })
      }

      window.location.reload()
    } catch (e) {
      notify.error("Failed to update workspace.", e instanceof Error ? e : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Update workspace"
      centered
    >
      <form onSubmit={form.onSubmit((values) => handleUpdateWorkspace(values))}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              required
              withAsterisk
              label="Name"
              placeholder="Clinical letters"
              {...form.getInputProps("name")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Description"
              placeholder="500 letters provided by LSE hospital"
              {...form.getInputProps("description")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Divider label="AI model" labelPosition="left" />
            <Text size="xs" c="dimmed" mt={8}>
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
              Update
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  )
}

export default Header
