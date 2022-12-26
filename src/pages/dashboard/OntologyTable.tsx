import { Group, Button, ActionIcon, Grid, Modal, TextInput, useMantineTheme, Text, Card, Table, Anchor } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { IconTrash, IconEdit, IconFile, IconUpload, IconX, IconSearch, IconCheck, IconPlus } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Ontology } from "storage/database/Database"
import { ModalProps } from "./Interfaces"
import { openConfirmModal } from "@mantine/modals"
import { useRecoilState } from "recoil"
import { tutorialProgressState } from "storage/state/Dashboard"
import { useDebouncedState } from "@mantine/hooks"

function OntologyTable() {
  const [openExploreModal, setOpenExploreModal] = useState(false)
  const [openUploadModal, setOpenUploadModal] = useState(false)
  const [ontologies, setOntologies] = useState<Ontology[]>([])
  const [tutorialProgress, setTutorialProgress] = useRecoilState(tutorialProgressState)

  const openConfirmDelete = (ontology: Ontology) => openConfirmModal({
    title: <>Are you sure you want to delete the '{ontology.name}' ontology?</>,
    children: (
      <Text size="sm" color="dimmed">
        All data associated with this ontology will be
        irreversible deleted for all collaborators.
      </Text>
    ),
    labels: { confirm: "Delete", cancel: "Cancel" },
    onConfirm: () => {
      database
        .deleteOntology(ontology.id)
        .then(() => setOntologies(ontologies.filter(i => i.id !== ontology.id)))
        .catch(alert)
    },
  })

  useEffect(() => {
    refreshOntologies()
  }, [])

  const refreshOntologies = () => {
    database
      .getOntologies()
      .then(setOntologies)
  }

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withBorder={false}
        highlightOnHover
        emptyState="Upload an ontology or add an existing one"
        borderRadius={5}
        sx={{ minHeight: "400px" }}
        records={ontologies}
        columns={[
          { accessor: "name", title: <Text size={16}>Ontology</Text> },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="subtle" onClick={() => {
                  setOpenExploreModal(true)
                  setTutorialProgress({
                    ...tutorialProgress,
                    "exploreOntologies": true,
                  })
                }} mr={5}>
                  Use common ontology
                </Button>

                <Button onClick={() => setOpenUploadModal(true)}>
                  Upload ontology
                </Button>
              </Group>
            ),
            textAlignment: "right",
            render: (ontology) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon>
                  <IconTrash
                    size={16}
                    onClick={() => openConfirmDelete(ontology)}
                  />
                </ActionIcon>

                <ActionIcon>
                  <IconEdit size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />

      <ExploreOntologiesModal
        openedModal={openExploreModal}
        setOpenedModal={setOpenExploreModal}
        refreshTable={refreshOntologies}
      />

      <UploadOntologyModal
        openedModal={openUploadModal}
        setOpenedModal={setOpenUploadModal}
      />
    </Card>
  )
}

function ExploreOntologiesModal({ openedModal, setOpenedModal, refreshTable }: ModalProps) {
  const [search, setSearch] = useDebouncedState("", 200)
  const [ontologies, setOntologies] = useState<Ontology[]>([])
  const [activeOntologies, setActiveOntologies] = useState<Ontology[]>([])

  useEffect(() => {
    database
      .getDefaultOntologies()
      .then(setOntologies)
  }, [])

  useEffect(() => {
    database
      .getOntologies()
      .then(setActiveOntologies)
      .then(refreshTable)
  }, [refreshTable])

  const addOntology = (ontologyId: string) => {
    database
      .useDefaultOntology(ontologyId)
      .then(() => {
        const ontology = ontologies.find(i => i.id === ontologyId)!
        setActiveOntologies([...activeOntologies, ontology])
      })
  }

  const removeOntology = (ontologyId: string) => {
    database
      .removeDefaultOntology(ontologyId)
      .then(() => setActiveOntologies(activeOntologies.filter(i => i.id !== ontologyId)))
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Common ontologies"
      centered
    >
      <TextInput
        placeholder="Search for an ontology"
        icon={<IconSearch />}
        mb={10}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Table>
        <tbody>
          {ontologies
            .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
            .map((ontology) => {
              const isActive = activeOntologies.some(i => i.id === ontology.id)

              return (
                <tr key={ontology.id}>
                  <td>{ontology.name}</td>
                  <td>{ontology.description ?? "No description"}</td>
                  <td>
                    {!isActive && (
                      <Button
                        variant="subtle"
                        onClick={() => addOntology(ontology.id)}
                        fullWidth
                      >
                        <IconPlus size={16} /> Add
                      </Button>
                    )}

                    {isActive && (
                      <Button
                        variant="subtle"
                        color="green"
                        onClick={() => removeOntology(ontology.id)}
                        fullWidth
                      >
                        <IconCheck size={16} /> Added
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </Table>
    </Modal>
  )
}

export interface OntologyRow {
  concept: string
  code: string
}

function UploadOntologyModal({ openedModal, setOpenedModal }: ModalProps) {
  const theme = useMantineTheme()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const addOntology = async () => {
    const content = await file?.text() ?? ""

    const rows: OntologyRow[] = []

    content
      .split("\n")
      .forEach(row => {
        if (row === "") return null

        const parts = row.split("***")
        const concept = parts[0]
        const code = parts[1]

        if (concept === undefined || code === undefined) return null

        rows.push({
          concept,
          code,
        })
      })

    database
      .addOntology(name, description, rows)
      .then(() => {
        setName("")
        setDescription("")
        setFile(null)
      })
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Upload an ontology"
      centered
    >
      <Grid>
        <Grid.Col xs={12}>
          <TextInput
            required
            withAsterisk
            label="Name"
            placeholder="UMLS"
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col xs={12}>
          <TextInput
            label="Description"
            placeholder="Clinical terminology"
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col xs={12}>
          <Text size={15}>
            Mappings <span style={{ color: theme.colors.red[theme.colorScheme === "dark" ? 4 : 6] }}>*</span>
          </Text>

          <Text size={13} color="dimmed" mb={2}>
            The structure of the ontology must be in the format defined <Anchor href="#">here</Anchor>.
          </Text>

          <Dropzone
            onDrop={(files) => setFile(files[0])}
            onReject={() => alert("Failed to upload files, please refresh and try again")}
            maxSize={3 * 1024 ** 2}
            accept={["text/plain"]}
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

              <div style={{ textAlign: "center" }}>
                <Text size="xl" inline>
                  Drag or click to select ontology file
                </Text>

                <Text size="sm" color="dimmed" inline mt={7}>
                  Must be a .txt file that does not exceed 5MB.
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Grid.Col>

        <Grid.Col xs={12}>
          <Group position="right">
            <Button onClick={addOntology}>
              Upload
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Modal>
  )
}

export default OntologyTable
