import { Card, Checkbox, Text, Group } from "@mantine/core"
import { Link } from "react-router-dom"
import { useDashboardStore } from "storage/state/Dashboard"
import { Path } from "utils/Path"
import classes from "./AccountOverview.module.css"

function AccountOverview() {
  const tutorialProgress = useDashboardStore((s) => s.tutorialProgress)
  const setTutorialProgress = useDashboardStore((s) => s.setTutorialProgress)

  return (
    <Card shadow="xs" radius={5} p="xl" className={classes.card}>
      <Group justify="space-between">
        <Text size="lg" className={classes.title} fw={500}>
          Welcome to Markup!
        </Text>
      </Group>

      <Text size="md" c="dimmed" mt={10} mb="xl">
        You're currently on the dashboard where you can manage workspaces and ontologies.
        Ready to get started? Follow the steps below:
      </Text>

      <Checkbox
        readOnly
        checked={tutorialProgress.readDocs}
        label={
          <>
            Read the <Link
              to={Path.Docs}
              target="_blank"
              onClick={() => {
                setTutorialProgress({
                  ...tutorialProgress,
                  readDocs: true,
                })
              }}
            >
              <Text display="inline" className={classes.linkText}>
                Quick Start
              </Text>
            </Link> guide
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
