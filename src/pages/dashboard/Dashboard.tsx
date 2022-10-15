import { createStyles, Card, Text, Container, Grid, Checkbox, Anchor } from "@mantine/core"
import { useState } from "react"
import { Link } from "react-router-dom"
import { openTab } from "utils/Location"
import { Path } from "utils/Path"

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

  return (
    <Container my="md" size="lg">
      <Grid>
        <Grid.Col xs={12}>
          <Card withBorder radius="md" p="xl" className={classes.card}>
            <Text size="lg" className={classes.title} weight={500}>
              Welcome to Markup!
            </Text>

            <Text size="md" color="dimmed" mt={10} mb="xl">
              You're currently on the dashboard where you can manage your annotation
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

        {/* <Grid.Col xs={7}>
          <Card withBorder radius="md" p="xl" className={classes.card}>
            <Text size="lg" className={classes.title} weight={500}>
              hi
            </Text>
            <Text size="xs" color="dimmed" mt={3} mb="xl">
              yo
            </Text>
            how are you?
          </Card>
        </Grid.Col>

        <Grid.Col xs={5}>
          <Card withBorder radius="md" p="xl" className={classes.card}>
            <Text size="lg" className={classes.title} weight={500}>
              hi
            </Text>
            <Text size="xs" color="dimmed" mt={3} mb="xl">
              yo
            </Text>
            how are you?
          </Card>
        </Grid.Col> */}
      </Grid>
    </Container>
  )
}

export default Dashboard
