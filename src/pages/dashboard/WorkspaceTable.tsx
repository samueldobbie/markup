import { Group, Button, ActionIcon, Text, Grid, Modal, TextInput, Card, Tooltip, Avatar } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconPlayerPlay, IconTrashX, IconUsers } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import { moveToPage } from "utils/Location"
import { ModalProps } from "./Interfaces"
import { toSetupUrl } from "utils/Path"
import { openConfirmModal } from "@mantine/modals"
import { tutorialProgressState } from "storage/state/Dashboard"
import { useRecoilState } from "recoil"
import { supabase } from "utils/Supabase"

function WorkspaceTable() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [ownedWorkspaceIds, setOwnedWorkspaceIds] = useState<string[]>([])
  const [workspace, setWorkspace] = useState<Workspace>()

  const [openedCreateWorkspaceModal, setOpenedCreateWorkspaceModal] = useState(false)
  const [openedManageCollaboratorsModal, setOpenedManageCollaboratorsModal] = useState(false)

  const openConfirmDeleteModal = (workspace: Workspace) => openConfirmModal({
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
      .then((result) => {
        const ownedWorkspaces = result["owner"]
        const collaboratorWorkspaces = result["collaborator"]
        const workspaces = ownedWorkspaces.concat(collaboratorWorkspaces)

        setWorkspaces(workspaces)
        setOwnedWorkspaceIds(ownedWorkspaces.map(i => i.id))
      })
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
                  {ownedWorkspaceIds.includes(workspace.id) && (
                    <>
                      {workspace.description || "No description"} - Owner ({workspace.collaborators} collaborators)
                    </>
                  )}

                  {!ownedWorkspaceIds.includes(workspace.id) && (
                    <>
                      {workspace.description || "No description"} - Collaborator
                    </>
                  )}
                </Text>
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Button onClick={() => setOpenedCreateWorkspaceModal(true)}>
                Create workspace
              </Button>
            ),
            textAlignment: "right",
            render: (workspace) => (
              <Group spacing={8} position="right" noWrap>
                {ownedWorkspaceIds.includes(workspace.id) && (
                  <Tooltip label="Delete workspace">
                    <ActionIcon
                      color="primary"
                      variant="subtle"
                      onClick={() => openConfirmDeleteModal(workspace)}
                    >
                      <IconTrashX
                        size={16}
                        color="rgb(217 138 138)"
                      />
                    </ActionIcon>
                  </Tooltip>
                )}

                {ownedWorkspaceIds.includes(workspace.id) && (
                  <Tooltip label="Manage collaborators">
                    <ActionIcon
                      color="primary"
                      variant="subtle"
                      onClick={() => {
                        setWorkspace(workspace)
                        setOpenedManageCollaboratorsModal(true)
                      }}
                    >
                      <IconUsers
                        size={16}
                        color="#acf2fa"
                      />
                    </ActionIcon>
                  </Tooltip>
                )}

                <Tooltip label="Annotate">
                  <ActionIcon
                    color="primary"
                    variant="subtle"
                    onClick={() => moveToPage(toSetupUrl(workspace.id))}
                  >
                    <IconPlayerPlay
                      size={16}
                      color="#8ad98a"
                    />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />

      <CreateWorkspaceModal
        openedModal={openedCreateWorkspaceModal}
        setOpenedModal={setOpenedCreateWorkspaceModal}
      />

      {workspace && (
        <ManageCollaboratorsModal
          openedModal={openedManageCollaboratorsModal}
          setOpenedModal={setOpenedManageCollaboratorsModal}
          workspace={workspace}
        />
      )}
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

export interface WorkspaceCollaborator {
  access_id: string
  user_id: string
  email: string
}

interface ManageCollaboratorsModalProps {
  workspace: Workspace
  openedModal: boolean
  setOpenedModal: (opened: boolean) => void
}

function ManageCollaboratorsModal({ workspace, openedModal, setOpenedModal }: ManageCollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<WorkspaceCollaborator[]>([])
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const f = async () => {
      const { data } = await supabase.auth.getUser()

      if (data && data.user) {
        setUserId(data.user.id)
      }
    }

    f()
  }, [])

  const form = useForm({
    initialValues: {
      email: "",
    },
  })

  const handleAddCollaborator = async (email: string) => {
    database
      .addWorkspaceCollaborator(workspace.id, email)
      .then((collaborator) => setCollaborators([...collaborators, collaborator]))
  }

  useEffect(() => {
    database
      .getWorkspaceCollaborators(workspace.id)
      .then(setCollaborators)
  }, [workspace.id])

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Manage collaborators"
      centered
    >
      <form onSubmit={form.onSubmit((values) => handleAddCollaborator(values.email))}>
        <Grid>
          {collaborators.map((collaborator, index) => {
            if (collaborator.user_id === userId) {
              return null
            }

            return (
              <Grid.Col xs={12}>
                <Group position="apart" noWrap>
                  <Group position="left" noWrap>
                    <Avatar key={index} radius="xl" color="primary">
                      {collaborator.email.slice(0, 2)}
                    </Avatar>

                    <Text>
                      {collaborator.email}
                    </Text>
                  </Group>

                  <Group position="right" noWrap>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                    >
                      <IconTrashX size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Grid.Col>
            )
          })}

          <Grid.Col xs={12}>
            <Group>
              <TextInput
                label="Add collaborator"
                placeholder="Enter their email"
                description={
                  <>
                    Collaborators will have full access to the
                    workspace <b>{workspace.name}</b>. You can revoke
                    their access at any time. The provided email
                    must be associated with an existing Markup user account.
                  </>
                }
                {...form.getInputProps("email")}
              />

              <Button type="submit">
                Invite
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  )
}

export default WorkspaceTable
