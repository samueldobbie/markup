import { Group, Button, ActionIcon, Text, Grid, Modal, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconTrash, IconEdit, IconPlayerPlay } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Session } from "utils/Database"
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
        borderRadius="md"
        records={sessions}
        columns={[
          {
            accessor: "name",
            title: <Text size={16}>Annotation Sessions</Text>,
          },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="outline" onClick={() => setOpenedModal(true)}>
                  Create Session
                </Button>
              </Group>
            ),
            textAlignment: "right",
            render: (session) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon color="red">
                  <IconTrash size={16} />
                </ActionIcon>

                <ActionIcon color="blue">
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon color="green">
                  <IconPlayerPlay size={16} />
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
    const error = await database.addSession(name)

    if (error) {
      alert("Failed to create session")
    }
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
