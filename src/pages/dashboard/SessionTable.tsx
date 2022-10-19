import { Group, Button, ActionIcon, Text, Grid, Modal, TextInput } from "@mantine/core"
import { IconTrash, IconEdit, IconPlayerPlay } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useState } from "react"
import { addAnnotationSession } from "utils/Database"
import { ModalProps } from "./Interfaces"

interface Props {
  completeTutorialStep: (v: string) => void
}

function SessionTable({ completeTutorialStep }: Props) {
  const [openedModal, setOpenedModal] = useState(false)

  const records = [
    {
      "id": "ab1e3aa6-3116-4e0d-a33d-9262aac86747",
      "name": "Pfeffer and Sons",
    },
    {
      "id": "6c2c52f1-e197-4892-ae8e-5b5e42c226cb",
      "name": "Hettinger, Willms and Connelly",
    },
    {
      "id": "9a2e51e0-5bbe-49af-a748-546509792e28",
      "name": "Champlin - Spencer",
    },
    {
      "id": "41e6105b-1115-4414-aaa6-ace1944ab3f2",
      "name": "Zulauf, McLaughlin and Jaskolski",
    },
    {
      "id": "dcc6476c-2b6c-4acd-955f-32a0337b5832",
      "name": "Shanahan - Turcotte",
    },
    {
      "id": "ccdbb85d-2175-4865-a69c-a76557216364",
      "name": "Gutkowski Inc",
    },
    {
      "id": "19df3e35-1577-48a7-9e2f-f79c4f6c36ef",
      "name": "Stark Inc",
    },
    {
      "id": "5e50f063-6620-491c-904c-fe8e40488802",
      "name": "Schmidt and Sons",
    },
    {
      "id": "a46de859-251b-42f6-a6c4-1642beba6b56",
      "name": "Mohr - Raynor",
    },
    {
      "id": "06f55c10-2481-4b5d-9a70-d8845f5e1381",
      "name": "Tromp, Runolfsson and Bahringer",
    }
  ]

  return (
    <>
      <DataTable
        withBorder
        highlightOnHover
        borderRadius="md"
        records={records}
        columns={[
          { accessor: "name", title: <Text size={16}>Annotation Sessions</Text> },
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
            render: (company) => (
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

function CreateSessionModal({ openedModal, setOpenedModal }: ModalProps) {
  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Create an annotation session"
    >
      <Grid>
        <Grid.Col>
          <TextInput
            required
            withAsterisk
            label="Session name"
            placeholder="Clinical letters"
          />
        </Grid.Col>

        <Grid.Col>
          <Button onClick={() => {
            addAnnotationSession("some-name")
          }}>
            Create
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  )
}

export default SessionTable
