import { Group, Button, ActionIcon, Grid, Modal, TextInput, useMantineTheme, Text } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { IconTrash, IconEdit, IconFile, IconUpload, IconX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Ontology } from "storage/database/Database"
import { ModalProps } from "./Interfaces"
import { openConfirmModal } from "@mantine/modals"

interface Props {
  completeTutorialStep: (v: string) => void
}

function OntologyTable({ completeTutorialStep }: Props) {
  const [openExploreModal, setOpenExploreModal] = useState(false)
  const [openUploadModal, setOpenUploadModal] = useState(false)
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
        .deleteOntology(ontology.id)
        .then(() => setOntologies(ontologies.filter(i => i.id !== ontology.id)))
        .catch(alert)
    },
  })

  useEffect(() => {
    database
      .getOntologies()
      .then(setOntologies)
  }, [])

  return (
    <>
      <DataTable
        withBorder
        highlightOnHover
        emptyState="Upload an ontology or explore existing ones"
        borderRadius={5}
        sx={{ minHeight: "400px" }}
        records={ontologies}
        columns={[
          { accessor: "name", title: <Text size={16}>Ontology</Text> },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="subtle" onClick={() => setOpenExploreModal(true)}>
                  Explore
                </Button>

                <Button variant="light" onClick={() => setOpenUploadModal(true)}>
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
      />

      <UploadOntologyModal
        openedModal={openUploadModal}
        setOpenedModal={setOpenUploadModal}
      />
    </>
  )
}

function ExploreOntologiesModal({ openedModal, setOpenedModal }: ModalProps) {
  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Explore existing ontologies"
      centered
    >
      <Text>
        I'll be adding existing ontologies (e.g. UMLS) soon
      </Text>
    </Modal>
  )
}

function UploadOntologyModal({ openedModal, setOpenedModal }: ModalProps) {
  const theme = useMantineTheme()

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Upload an ontology"
      centered
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
          <Button onClick={() => database.addOntology()}>
            Upload
          </Button>
        </Grid.Col>
      </Grid>
    </Modal>
  )
}

export default OntologyTable
