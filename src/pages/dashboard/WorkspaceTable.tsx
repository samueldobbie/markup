import { Group, Button, ActionIcon, Text, Grid, Modal, TextInput, Card } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconPlayerPlay, IconTrashX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import { moveToPage } from "utils/Location"
import { ModalProps } from "./Interfaces"
import { toSetupUrl } from "utils/Path"
import { openConfirmModal } from "@mantine/modals"
import { tutorialProgressState } from "storage/state/Dashboard"
import { useRecoilState } from "recoil"

function WorkspaceTable() {
  const [openedModal, setOpenedModal] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  const openConfirmDelete = (workspace: Workspace) => openConfirmModal({
    title: <>Are you sure you want to delete the '{workspace.name}' workspace?</>,
    children: (
      <Text size="sm" color="dimmed">
        All data associated with this workspace will be
        irreversible deleted for all collaborators.
      </Text>
    ),
    labels: { confirm: "Delete", cancel: "Cancel" },
    onConfirm: () => {
      database
        .deleteWorkspace(workspace.id)
        .then(() => setWorkspaces(workspaces.filter(i => i.id !== workspace.id)))
        .catch(alert)
    },
  })

  useEffect(() => {
    database
      .getWorkspaces()
      .then(setWorkspaces)
  }, [])

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withBorder={false}
        emptyState="Create a workspace to start annotating"
        borderRadius={5}
        sx={{ minHeight: "400px" }}
        records={workspaces}
        columns={[
          {
            accessor: "name",
            title: <Text size={16}>Workspaces</Text>,
            render: (workspace) => (
              <>
                <Text>
                  {workspace.name}
                </Text>

                <Text size="sm" color="dimmed">
                  {workspace.description}
                </Text>
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Button onClick={() => setOpenedModal(true)}>
                Create workspace
              </Button>
            ),
            textAlignment: "right",
            render: (workspace) => (
              <Group spacing={8} position="right" noWrap>
                <ActionIcon
                  color="primary"
                  variant="subtle"
                  onClick={() => openConfirmDelete(workspace)}
                >
                  <IconTrashX
                    size={16}
                    style={{ color: "rgb(217 138 138)" }}
                  />
                </ActionIcon>

                <ActionIcon
                  color="primary"
                  variant="subtle"
                  onClick={() => moveToPage(toSetupUrl(workspace.id))}
                >
                  <IconPlayerPlay
                    size={16}
                    style={{ color: "#8ad98a" }}
                  />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />

      <CreateWorkspaceModal
        openedModal={openedModal}
        setOpenedModal={setOpenedModal}
      />
    </Card>
  )
}

interface CreateWorkspaceForm {
  name: string
  description?: string
}

function CreateWorkspaceModal({ openedModal, setOpenedModal }: ModalProps) {
  const [tutorialProgress, setTutorialProgress] = useRecoilState(tutorialProgressState)

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    }
  })

  const handleCreateWorkspace = async (form: CreateWorkspaceForm) => {
    const { name, description } = form
    const workspaces = await database.addWorkspace(name, description || "")

    if (workspaces.length === 0) {
      alert("Failed to create workspace")
      return
    }

    moveToPage(toSetupUrl(workspaces[0].id))
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Create workspace"
      centered
    >
      <form onSubmit={form.onSubmit((values) => {
        handleCreateWorkspace(values)
        setTutorialProgress({
          ...tutorialProgress,
          "createWorkspace": true,
        })
      })}>
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
              Create
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  )
}

export default WorkspaceTable
