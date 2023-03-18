import { Group, Button, ActionIcon, Grid, Modal, TextInput, useMantineTheme, Text, Card, Table, Center, Tooltip } from "@mantine/core"
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
import { useForm } from "@mantine/form"
import notify from "utils/Notifications"
import { Path } from "utils/Path"
import { Link } from "react-router-dom"

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
        .then(() => {
          setOntologies(ontologies.filter(i => i.id !== ontology.id))
          notify.success(`Ontology '${ontology.name}' deleted.`)
        })
        .catch((e) => notify.error("Could not delete ontology.", e))
    },
    centered: true,
  })

  useEffect(() => {
    refreshTable()
  }, [])

  const refreshTable = () => {
    database
      .getUserOntologies()
      .then(setOntologies)
      .catch((e) => notify.error("Could not load ontologies.", e))
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
            title: (
              <Text size={16}>
                Ontology

                <Text size={13} color="dimmed">
                  Terminologies for mapping
                </Text>
              </Text>
            ),
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
      .catch((e) => notify.error("Could not load default ontologies.", e))
  }, [])

  const addOntology = (ontologyId: string) => {
    database
      .useDefaultOntology(ontologyId)
      .then(() => {
        const ontology = defaultOntologies.find(i => i.id === ontologyId)!
        setOntologies([...ontologies, ontology])
        notify.success(`Ontology '${ontology.name}' added.`)
      })
      .catch((e) => notify.error("Could not add ontology.", e))
  }

  const removeOntology = (ontologyId: string) => {
    database
      .removeDefaultOntology(ontologyId)
      .then(() => {
        notify.success("Ontology removed.")
        setOntologies(ontologies.filter(i => i.id !== ontologyId))
      })
      .catch((e) => notify.error("Could not remove ontology.", e))
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
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    }
  })

  const [mappingFile, setMappingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOntologyUpload = async ({ name, description }: any) => {
    if (mappingFile === null) {
      setError("Please select a file containing the concept mappings.")
      return
    }

    const content = JSON.parse(await mappingFile.text())
    const concepts: OntologyConcept[] = []

    if (Array.isArray(content)) {
      content.forEach((row) => {
        const { name, code } = row
        const isValidRow = (
          typeof name === "string" &&
          typeof code === "string"
        )

        if (isValidRow) {
          concepts.push({
            name,
            code,
          })
        }
      })
    }

    if (concepts.length === 0) {
      setMappingFile(null)
      setError("File is empty or an invalid format. Please review the docs for more information.")
      return
    }

    database
      .addOntology(name, description, concepts)
      .then(() => {
        form.reset()
        setMappingFile(null)
        setOpenedModal(false)
        refreshTable!()
        notify.success(`Ontology '${name}' uploaded.`)
      })
      .catch((e) => notify.error("Could not upload ontology.", e))
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Upload an ontology"
      centered
    >
      <form onSubmit={form.onSubmit((values) => handleOntologyUpload(values))}>
        <Grid>
          {error && (
            <Grid.Col xs={12}>
              <div style={{ backgroundColor: "rgb(255 226 237)", padding: 5, borderRadius: 5 }}>
                <Text color="red" align="center">
                  {error}
                </Text>
              </div>
            </Grid.Col>
          )}

          <Grid.Col xs={12}>
            <TextInput
              required
              withAsterisk
              label="Name"
              placeholder="UMLS"
              {...form.getInputProps("name")}
            />
          </Grid.Col>

          <Grid.Col xs={12}>
            <TextInput
              label="Description"
              placeholder="Clinical terminology"
              {...form.getInputProps("description")}
            />
          </Grid.Col>

          <Grid.Col xs={12}>
            <Text size={15}>
              Concept Mappings <span style={{ color: theme.colors.red[theme.colorScheme === "dark" ? 4 : 6] }}>*</span>
            </Text>

            <Text size={13} color="dimmed" mb={2}>
              Mappings must be a JSON file in the format defined <Link to={Path.Docs} target="_blank">here</Link>.
            </Text>

            <Dropzone
              onDrop={(files) => setMappingFile(files[0])}
              onReject={() => setError("Failed to upload files, please refresh and try again")}
              maxSize={3 * 1024 ** 2}
              accept={[".json"]}
              multiple={false}
            >
              <Group position="center" style={{ pointerEvents: "none" }}>
                <Dropzone.Accept>
                  <Center>
                    <IconUpload
                      size={40}
                      stroke={1.5}
                      color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]}
                    />
                  </Center>

                  <Text size="sm" color="dimmed" mt={5}>
                    {mappingFile ? mappingFile.name : "No file selected"}
                  </Text>
                </Dropzone.Accept>

                <Dropzone.Reject>
                  <Center>
                    <IconX
                      size={40}
                      stroke={1.5}
                      color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
                    />
                  </Center>

                  <Text size="lg" color="dimmed" mt={5}>
                    {mappingFile ? mappingFile.name : "No file selected"}
                  </Text>
                </Dropzone.Reject>

                <Dropzone.Idle>
                  <Center>
                    <IconFile size={40} stroke={1.5} />
                  </Center>

                  <Text size="lg" color="dimmed" mt={5}>
                    {mappingFile ? mappingFile.name : "No file selected"}
                  </Text>
                </Dropzone.Idle>
              </Group>
            </Dropzone>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Group position="right">
              <Button type="submit">
                Upload
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  )
}

export default OntologyTable
