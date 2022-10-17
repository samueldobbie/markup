import { createStyles, Card, Text, Container, Grid, Checkbox, Anchor, ActionIcon, Group, Button } from "@mantine/core"
import { Edit } from "@mui/icons-material"
import { IconEar, IconEdit, IconPlayerPlay, IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useState } from "react"

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
  const { classes } = useStyles()

  const [tutorialProgress, setTutorialProgress] = useState({
    readDocs: false,
  })

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

            <Checkbox label="Create an ontology" mt={15} />
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
                    <Button variant="outline">
                      New Session
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
                    <Button variant="subtle">
                      Explore
                    </Button>

                    <Button variant="outline">
                      New Ontology
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
  )
}

export default Dashboard
