import { Container, Grid } from "@mantine/core"
import { useState } from "react"
import AccountOverview from "./AccountOverview"
import OntologyTable from "./OntologyTable"
import SessionTable from "./SessionTable"

export interface TutorialProgress {
  readDocs: boolean,
  createSession: boolean,
  exploreOntologies: boolean,
}

function Dashboard() {
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress>({
    readDocs: false,
    createSession: false,
    exploreOntologies: false,
  })

  const completeTutorialStep = (step: string) => {
    setTutorialProgress({
      ...tutorialProgress,
      [step]: true,
    })
  }

  return (
    <>
      <Container my="md" size="xl">
        <Grid>
          <Grid.Col xs={12}>
            <AccountOverview
              tutorialProgress={tutorialProgress}
              completeTutorialStep={completeTutorialStep}
            />
          </Grid.Col>

          <Grid.Col xs={12} md={6}>
            <SessionTable completeTutorialStep={completeTutorialStep} />
          </Grid.Col>

          <Grid.Col xs={12} md={6}>
            <OntologyTable completeTutorialStep={completeTutorialStep} />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  )
}

export default Dashboard
