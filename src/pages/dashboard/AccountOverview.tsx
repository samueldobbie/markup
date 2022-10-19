import { Card, Checkbox, Anchor, createStyles, Text } from "@mantine/core"
import { TutorialProgress } from "./Dashboard"

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

interface Props {
  tutorialProgress: TutorialProgress
  completeTutorialStep: (v: string) => void
}

function AccountOverview({ tutorialProgress, completeTutorialStep }: Props) {
  const { classes } = useStyles()

  return (
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
              onClick={() => completeTutorialStep("readDocs")}
              sx={{
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Get Started
            </Anchor> guide (~2 mins)
          </>
        } />

      <Checkbox
        mt={15}
        checked={tutorialProgress.createSession}
        label="Create an annotation session"
      />

      <Checkbox
        mt={15}
        checked={tutorialProgress.exploreOntologies}
        label="Explore existing ontologies"
      />
    </Card>
  )
}

export default AccountOverview
