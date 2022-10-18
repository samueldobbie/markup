import { createStyles, Card, Text, Container, Grid, Checkbox, Anchor, ActionIcon, Group, Button, Modal, TextInput, Table } from "@mantine/core"
import { IconEdit, IconFile, IconPlayerPlay, IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useState } from "react"
import { useMantineTheme } from "@mantine/core"
import { IconUpload, IconX } from "@tabler/icons"
import { Dropzone } from "@mantine/dropzone"

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  item: {
    "& + &": {
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },
  },

  switch: {
    "& *": {
      cursor: "pointer",
    },
  },

  title: {
    lineHeight: 1,
  },
}))

function Dashboard() {
  const theme = useMantineTheme()

  const { classes } = useStyles()

  const [tutorialProgress, setTutorialProgress] = useState({ readDocs: false })
  const [openNewSessionModal, setOpenNewSessionModal] = useState(false)
  const [openNewOntologyModal, setOpenNewOntologyModal] = useState(false)
  const [openExploreOntologyModal, setOpenExploreOntologyModal] = useState(false)

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
    <>
      <Container my="md" size="xl">
        <Grid>
          <Grid.Col xs={12}>
            <Card withBorder radius="md" p="xl" className={classes.card}>
              <Text size="lg" className={classes.title} weight={500}>
                Welcome to Markup!
              </Text>

              <Text size="md" color="dimmed" mt={10} mb="xl">
                You"re currently on the dashboard where you can manage your annotation
                sessions and ontologies. Complete the steps below to get familiar with Markup.
              </Text>

              <Checkbox
                checked={tutorialProgress.readDocs}
                label={
                  <>
                    Read the <Anchor
                      href="https://www.notion.so/Markup-Docs-91e9c5cfc6dc416fbcf2241d7c84e6c7"
                      target="_blank"
                      sx={{ fontWeight: "bold", textDecoration: "underline" }}
                      onClick={() => {
                        setTutorialProgress({
                          ...tutorialProgress,
                          readDocs: true,
                        })
                      }}
                    >
                      docs
                    </Anchor> (~2 mins)
                  </>
                } />

              <Checkbox label="Create an annotation session" mt={15} />

              <Checkbox label="Explore existing ontologies" mt={15} />
            </Card>
          </Grid.Col>

          <Grid.Col xs={12} md={6}>
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
                      <Button variant="outline" onClick={() => setOpenNewSessionModal(true)}>
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
          </Grid.Col>

          <Grid.Col xs={12} md={6}>
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
                      <Button variant="subtle" onClick={() => setOpenExploreOntologyModal(true)}>
                        Explore
                      </Button>

                      <Button variant="outline" onClick={() => setOpenNewOntologyModal(true)}>
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
          </Grid.Col>
        </Grid>
      </Container>

      <Modal
        opened={openNewSessionModal}
        onClose={() => setOpenNewSessionModal(false)}
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
            <Button>
              Create
            </Button>
          </Grid.Col>
        </Grid>
      </Modal>

      <Modal
        opened={openExploreOntologyModal}
        onClose={() => setOpenExploreOntologyModal(false)}
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

      <Modal
        opened={openNewOntologyModal}
        onClose={() => setOpenNewOntologyModal(false)}
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
    </>
  )
}

export default Dashboard
