import { Group, Button, ActionIcon, Grid, Modal, TextInput, useMantineTheme, Text, Card, Table, Anchor, Center, Tooltip } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { IconFile, IconUpload, IconX, IconSearch, IconCheck, IconPlus, IconTrashX } from "@tabler/icons"
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
  const [tutorialProgress, setTutorialProgress] = useRecoilState(tutorialProgressState)
  const [ontologies, setOntologies] = useState<Ontology[]>([])

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
        .deleteOntology(ontology.id, ontology.is_default)
        .then(() => setOntologies(ontologies.filter(i => i.id !== ontology.id)))
        .catch(alert)
    },
  })

  useEffect(() => {
    refreshTable()
  }, [])

  const refreshTable = () => {
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
          {
            accessor: "name",
            title: <Text size={16}>Ontology</Text>,
            render: (ontology) => (
              <>
                <Text>
                  {ontology.name}
                </Text>

                <Text size="sm" color="dimmed">
                  {ontology.description}
                </Text>
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Group spacing={8} position="right" noWrap>
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
              <Group spacing={8} position="right" noWrap>
                <Tooltip label="Delete ontology">
                  <ActionIcon
                    color="primary"
                    variant="subtle"
                    onClick={() => openConfirmDelete(ontology)}
                  >
                    <IconTrashX
                      size={16}
                      style={{ color: "rgb(217 138 138)" }}
                    />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />

      <ExploreOntologiesModal
        openedModal={openExploreModal}
        setOpenedModal={setOpenExploreModal}
        ontologies={ontologies}
        setOntologies={setOntologies}
      />

      <UploadOntologyModal
        openedModal={openUploadModal}
        setOpenedModal={setOpenUploadModal}
        refreshTable={refreshTable}
      />
    </Card>
  )
}

interface Props {
  openedModal: boolean
  setOpenedModal: (value: boolean) => void
  ontologies: Ontology[]
  setOntologies: (value: Ontology[]) => void
}

function ExploreOntologiesModal({ openedModal, setOpenedModal, ontologies, setOntologies }: Props) {
  const [search, setSearch] = useDebouncedState("", 200)
  const [defaultOntologies, setDefaultOntologies] = useState<Ontology[]>([])

  useEffect(() => {
    database
      .getDefaultOntologies()
      .then(setDefaultOntologies)
  }, [])

  const addOntology = (ontologyId: string) => {
    database
      .useDefaultOntology(ontologyId)
      .then(() => {
        const ontology = defaultOntologies.find(i => i.id === ontologyId)!
        setOntologies([...ontologies, ontology])
      })
  }

  const removeOntology = (ontologyId: string) => {
    database
      .removeDefaultOntology(ontologyId)
      .then(() => setOntologies(ontologies.filter(i => i.id !== ontologyId)))
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
          {defaultOntologies
            .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
            .map((defaultOntology) => {
              const isActive = ontologies.some(i => i.id === defaultOntology.id)

              return (
                <tr key={defaultOntology.id}>
                  <td>{defaultOntology.name}</td>
                  <td>{defaultOntology.description ?? "No description"}</td>
                  <td>
                    {!isActive && (
                      <Button
                        variant="subtle"
                        onClick={() => addOntology(defaultOntology.id)}
                        fullWidth
                      >
                        <IconPlus size={16} /> Add
                      </Button>
                    )}

                    {isActive && (
                      <Button
                        variant="subtle"
                        color="green"
                        onClick={() => removeOntology(defaultOntology.id)}
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

export interface OntologyConcept {
  name: string
  code: string
}

function UploadOntologyModal({ openedModal, setOpenedModal, refreshTable }: ModalProps) {
  const theme = useMantineTheme()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const addOntology = async () => {
    const content = await file?.text() ?? ""

    const concepts: OntologyConcept[] = []

    content
      .split("\n")
      .forEach(row => {
        if (row === "") return null

        const parts = row.split("***")
        const name = parts[0]
        const code = parts[1]

        if (name === undefined || code === undefined) return null

        concepts.push({
          name,
          code,
        })
      })

    database
      .addOntology(name, description, concepts)
      .then(() => {
        setName("")
        setDescription("")
        setFile(null)
        setOpenedModal(false)
        refreshTable!()
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
                <Center>
                  <IconUpload
                    size={50}
                    stroke={1.5}
                    color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]}
                  />
                </Center>

                <Text size="sm" color="dimmed" mt={7}>
                  {file ? file.name : "No file selected"}
                </Text>
              </Dropzone.Accept>

              <Dropzone.Reject>
                <Center>
                  <IconX
                    size={50}
                    stroke={1.5}
                    color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
                  />
                </Center>

                <Text size="lg" color="dimmed" mt={7}>
                  {file ? file.name : "No file selected"}
                </Text>
              </Dropzone.Reject>

              <Dropzone.Idle>
                <Center>
                  <IconFile size={50} stroke={1.5} />
                </Center>

                <Text size="lg" color="dimmed" mt={7}>
                  {file ? file.name : "No file selected"}
                </Text>
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
