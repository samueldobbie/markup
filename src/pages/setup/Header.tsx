import { Group, Button, Text, ActionIcon, Grid, Modal, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconArrowRight, IconDotsVertical, IconEdit, IconSettings } from "@tabler/icons"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { database } from "storage/database"
import { moveToPage } from "utils/Location"
import notify from "utils/Notifications"
import { Path, toAnnotateUrl } from "utils/Path"
import { SectionProps } from "./Setup"

function Header({ workspace, workspaceStatus }: SectionProps) {
  const { id } = useParams()

  const [openedEditWorkspaceModal, setOpenedEditWorkspaceModal] = useState(false)

  if (id === undefined) {
    return <></>
  }

  return (
    <>
      <Group position="apart">
        <Group position="left">
          <div>
            <Text size={25} sx={{ fontWeight: "bold" }}>
              {workspace.name}
            </Text>

            <Text color="dimmed" size={14}>
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
            Workspace settings
          </Button>

          <Button
            disabled={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument}
            onClick={() => moveToPage(toAnnotateUrl(id))}
            variant="light"
            color="green"
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
}

function EditWorkspaceModal({ workspace, openedModal, setOpenedModal }: any) {
  const form = useForm({
    initialValues: {
      name: workspace.name,
      description: workspace.description,
    }
  })

  const handleUpdateWorkspace = async (form: UpdateWorkspaceForm) => {
    const { name, description } = form

    await database
      .updateWorkspace(workspace.id, name, description || "")
      .then(() => window.location.reload())
      .catch((e) => notify.error("Failed to update workspace details.", e))
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
          <Grid.Col xs={12}>
            <TextInput
              required
              withAsterisk
              label="Name"
              placeholder="Clinical letters"
              {...form.getInputProps("name")}
            />
          </Grid.Col>

          <Grid.Col xs={12}>
            <TextInput
              label="Description"
              placeholder="500 letters provided by LSE hospital"
              {...form.getInputProps("description")}
            />
          </Grid.Col>

          <Grid.Col xs={12}>
            <Button type="submit">
              Update
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  )
}

export default Header
