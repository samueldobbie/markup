import { Group, Button, ActionIcon, Text, Grid, Modal, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconTrash, IconEdit, IconPlayerPlay } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Workspace } from "pages/database/Database"
import { moveToPage } from "utils/Location"
import { ModalProps } from "./Interfaces"
import { toAnnotateUrl, toSetupUrl } from "utils/Path"

interface Props {
  completeTutorialStep: (v: string) => void
}

function WorkspaceTable({ completeTutorialStep }: Props) {
  const [openedModal, setOpenedModal] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  useEffect(() => {
    database
      .getWorkspaces()
      .then(setWorkspaces)
  }, [])

  return (
    <>
      <DataTable
        withBorder
        highlightOnHover
        emptyState="Create a workspace to start annotating"
        borderRadius="md"
        sx={{ minHeight: "500px" }}
        records={workspaces}
        columns={[
          {
            accessor: "name",
            title: <Text size={16}>Workspaces</Text>,
          },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="light" onClick={() => setOpenedModal(true)}>
                  Create workspace
                </Button>
              </Group>
            ),
            textAlignment: "right",
            render: (workspace) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon color="red">
                  <IconTrash
                    size={16}
                    onClick={() => {
                      database
                        .deleteWorkspace(workspace.id)
                        .then(() => setWorkspaces(workspaces.filter(i => i.id !== workspace.id)))
                        .catch(alert)
                    }}
                  />
                </ActionIcon>

                <ActionIcon color="blue">
                  <IconEdit
                    size={16}
                    onClick={() => moveToPage(toSetupUrl(workspace.id))}
                  />
                </ActionIcon>

                <ActionIcon color="green">
                  <IconPlayerPlay
                    onClick={() => moveToPage(toAnnotateUrl(workspace.id))}
                    size={16}
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
    </>
  )
}

interface CreateWorkspaceForm {
  name: string
}

function CreateWorkspaceModal({ openedModal, setOpenedModal }: ModalProps) {
  const form = useForm({
    initialValues: {
      name: "",
    }
  })

  const handleCreateWorkspace = async (form: CreateWorkspaceForm) => {
    const { name } = form
    const workspaces = await database.addWorkspace(name)

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
    >
      <form onSubmit={form.onSubmit((values) => handleCreateWorkspace(values))}>
        <Grid>
          <Grid.Col>
            <TextInput
              required
              withAsterisk
              label="Workspace name"
              placeholder="Clinical letters"
              {...form.getInputProps("name")}
            />
          </Grid.Col>

          <Grid.Col>
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
