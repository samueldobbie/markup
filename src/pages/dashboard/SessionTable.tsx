import { Group, Button, ActionIcon, Text, Grid, Modal, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconTrash, IconEdit, IconPlayerPlay } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Session } from "utils/Database"
import { moveToPage } from "utils/Location"
import { ModalProps } from "./Interfaces"

interface Props {
  completeTutorialStep: (v: string) => void
}

function SessionTable({ completeTutorialStep }: Props) {
  const [openedModal, setOpenedModal] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    database
      .getSessions()
      .then(setSessions)
  }, [])

  return (
    <>
      <DataTable
        withBorder
        highlightOnHover
        emptyState="Create a session to start annotating"
        borderRadius="md"
        sx={{ minHeight: "500px" }}
        records={sessions}
        columns={[
          {
            accessor: "name",
            title: <Text size={16}>Sessions</Text>,
          },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="outline" onClick={() => setOpenedModal(true)}>
                  Create session
                </Button>
              </Group>
            ),
            textAlignment: "right",
            render: (session) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon color="red">
                  <IconTrash
                    size={16}
                    onClick={() => database.deleteSession(session.id)}
                  />
                </ActionIcon>

                <ActionIcon color="blue">
                  <IconEdit
                    size={16}
                    onClick={() => moveToPage(`/setup/${session.id.toString()}`)}
                  />
                </ActionIcon>

                <ActionIcon color="green">
                  <IconPlayerPlay
                    onClick={() => moveToPage(`/setup/${session.id.toString()}`)}
                    size={16}
                  />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />

      <CreateSessionModal
        openedModal={openedModal}
        setOpenedModal={setOpenedModal}
      />
    </>
  )
}

interface CreateSessionForm {
  name: string
}

function CreateSessionModal({ openedModal, setOpenedModal }: ModalProps) {
  const form = useForm({
    initialValues: {
      name: "",
    }
  })

  const handleCreateSession = async (form: CreateSessionForm) => {
    const { name } = form
    const sessions = await database.addSession(name)

    if (sessions.length === 0) {
      alert("Failed to create session")
      return
    }

    moveToPage(`/setup/${sessions[0].id.toString()}`)
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Create an annotation session"
    >
      <form onSubmit={form.onSubmit((values) => handleCreateSession(values))}>
        <Grid>
          <Grid.Col>
            <TextInput
              required
              withAsterisk
              label="Session name"
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

export default SessionTable
