import { Group, Button, ActionIcon, Grid, Modal, Table, TextInput, useMantineTheme, Text } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { IconTrash, IconEdit, IconPlayerPlay, IconFile, IconUpload, IconX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useState } from "react"
import { ModalProps } from "./Interfaces"

interface Props {
  completeTutorialStep: (v: string) => void
}

function OntologyTable({ completeTutorialStep }: Props) {
  const [openExploreModal, setOpenExploreModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)

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
          { accessor: "name", title: <Text size={16}>Ontology</Text> },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="subtle" onClick={() => setOpenExploreModal(true)}>
                  Explore
                </Button>

                <Button variant="outline" onClick={() => setOpenImportModal(true)}>
                  Import Ontology
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

      <ExploreOntologiesModal
        openedModal={openExploreModal}
        setOpenedModal={setOpenExploreModal}
      />

      <ImportOntologyModal
        openedModal={openImportModal}
        setOpenedModal={setOpenImportModal}
      />
    </>
  )
}

function ExploreOntologiesModal({ openedModal, setOpenedModal }: ModalProps) {
  const elements = [
    { ontologyName: "UMLS", name: "Carbon" },
    { ontologyName: "ICD-10", name: "Nitrogen" },
    { ontologyName: "SNOMED", name: "Yttrium" },
  ]

  const rows = elements.map((element) => (
    <tr key={element.name}>
      <td>{element.ontologyName}</td>
      <td><Button compact variant="subtle">Use</Button></td>
    </tr>
  ))

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Explore existing ontologies"
    >
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </Modal>
  )
}

function ImportOntologyModal({ openedModal, setOpenedModal }: ModalProps) {
  const theme = useMantineTheme()

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Import an ontology"
    >
      <Grid>
        <Grid.Col>
          <TextInput
            required
            withAsterisk
            label="Ontology name"
            placeholder="UMLS"
          />
        </Grid.Col>

        <Grid.Col>
          <Text size={14}>
            Ontology file
          </Text>

          <Dropzone
            onDrop={(files) => console.log("accepted files", files)}
            onReject={(files) => console.log("rejected files", files)}
            maxSize={3 * 1024 ** 2}
            accept={["text/plain", "text/markdown"]}
            multiple={false}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: "none" }}>
              <Dropzone.Accept>
                <IconUpload
                  size={50}
                  stroke={1.5}
                  color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]}
                />
              </Dropzone.Accept>

              <Dropzone.Reject>
                <IconX
                  size={50}
                  stroke={1.5}
                  color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
                />
              </Dropzone.Reject>

              <Dropzone.Idle>
                <IconFile size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag or click to select ontology file
                </Text>

                <Text size="sm" color="dimmed" inline mt={7}>
                  Must be a TXT file. Must not exceed 5MB.
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Grid.Col>

        <Grid.Col>
          <Button>
            Import
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  )
}

export default OntologyTable
