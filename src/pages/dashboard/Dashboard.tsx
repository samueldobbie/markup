import { useDashboardStore } from "storage/state/Dashboard"
import { Container, Grid } from "@mantine/core"
import AccountOverview from "./AccountOverview"
import OntologyTable from "./OntologyTable"
import WorkspaceTable from "./WorkspaceTable"

function Dashboard() {
  const showTutorial = useDashboardStore((s) => s.showTutorial)

  return (
    <>
      <Container my="md" size="xl">
        <Grid>
          {showTutorial && 
            <Grid.Col span={12}>
              <AccountOverview />
            </Grid.Col>
          }

          <Grid.Col span={{ base: 12, md: 6 }}>
            <WorkspaceTable />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <OntologyTable />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  )
}

export default Dashboard
