import { Card, Checkbox, Anchor, createStyles, Text, Group } from "@mantine/core"
import { useRecoilState } from "recoil"
import { tutorialProgressState } from "storage/state/Dashboard"

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

function AccountOverview() {
  const { classes } = useStyles()

  const [tutorialProgress, setTutorialProgress] = useRecoilState(tutorialProgressState)

  return (
    <Card shadow="xs" radius={5} p="xl">
      <Group position="apart">
        <Text size="lg" className={classes.title} weight={500}>
          Welcome to Markup!
        </Text>
      </Group>

      <Text size="md" color="dimmed" mt={10} mb="xl">
        You're currently on the dashboard where you can manage workspaces and ontologies.
        Ready to get started? Follow the steps below:
      </Text>

      <Checkbox
        readOnly
        checked={tutorialProgress.readDocs}
        label={
          <>
            Read the <Anchor
              href="https://www.notion.so/Markup-Docs-91e9c5cfc6dc416fbcf2241d7c84e6c7"
              target="_blank"
              onClick={() => {
                setTutorialProgress({
                  ...tutorialProgress,
                  "readDocs": true,
                })
              }}
              sx={{
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Quick Start
            </Anchor> guide
          </>
        } />

      <Checkbox
        mt={15}
        readOnly
        checked={tutorialProgress.createWorkspace}
        label="Create a workspace"
      />

      <Checkbox
        mt={15}
        readOnly
        checked={tutorialProgress.exploreOntologies}
        label="Explore common ontologies"
      />
    </Card>
  )
}

export default AccountOverview
