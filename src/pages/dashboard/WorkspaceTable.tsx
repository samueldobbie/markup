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
import notify from "utils/Notifications"

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
        .then(() => {
          setWorkspaces(workspaces.filter(i => i.id !== workspace.id))
          notify.success(`The workspace '${workspace.name}' has been deleted successfully.`)
        })
        .catch((e) => notify.error(`Failed to delete the workspace '${workspace.name}'.`, e))
    },
    centered: true,
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
      .catch((e) => notify.error("Failed to load workspaces.", e))
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
            title: (
              <Text size={16}>
                Workspaces

                <Text size={13} color="dimmed">
                  Your annotation sessions
                </Text>
              </Text>
            ),
            render: (workspace) => (
              <>
                <Text>
                  {workspace.name}
                </Text>

                <Text size="sm" color="dimmed">
                  {ownedWorkspaceIds.includes(workspace.id) && (
                    <>
                      {workspace.description || "No description"} - {workspace.collaborators} collaborators
                    </>
                  )}

                  {!ownedWorkspaceIds.includes(workspace.id) && (
                    <>
                      {workspace.description || "No description"} - Shared with you
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
    
    await database
      .addWorkspace(name, description || "")
      .then (workspaceId => moveToPage(toSetupUrl(workspaceId)))
      .catch((e) => notify.error("Failed to create workspace.", e))
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
  const [collaboratorEmails, setCollaboratorEmails] = useState<string[]>([])

  const form = useForm({
    initialValues: {
      email: "",
    },
  })

  const handleAddCollaborator = async (email: string) => {
    database
      .addWorkspaceCollaborator(workspace.id, email)
      .then(() => {
        setCollaboratorEmails([...collaboratorEmails, email])
        notify.success(`Added ${email} as a collaborator.`)
      })
      .catch((e) => notify.error(`Failed to add  ${email} as a collaborator.`, e))
  }

  const handleRemoveCollaborator = async (email: string) => {
    database
      .removeWorkspaceCollaborator(workspace.id, email)
      .then(() => {
        setCollaboratorEmails(collaboratorEmails.filter(c => c !== email))
        notify.success(`Removed ${email} as a collaborator.`)
      })
      .catch((e) => notify.error(`Failed to remove ${email} as a collaborator.`, e))
  }

  useEffect(() => {
    const f = async () => {
      database
        .getWorkspaceCollaboratorEmails(workspace.id)
        .then(emails => setCollaboratorEmails(emails))
        .catch((e) => notify.error("Failed to get collaborators.", e))
    }

    f()
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
          {collaboratorEmails.map((collaboratorEmail, index) => {
            return (
              <Grid.Col xs={12}>
                <Group position="apart" noWrap>
                  <Group position="left" noWrap>
                    <Avatar key={index} radius="xl" color="primary">
                      {collaboratorEmail.slice(0, 2)}
                    </Avatar>

                    <Text>
                      {collaboratorEmail}
                    </Text>
                  </Group>

                  <Group position="right" noWrap>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleRemoveCollaborator(collaboratorEmail)}
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
