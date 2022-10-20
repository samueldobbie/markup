import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Session } from "utils/Database"
import Config from "./Config"
import Documents from "./Documents"
import Ontology from "./Ontology"
import Header from "./Header"

function Setup() {
  const { id } = useParams()

  const [session, setSession] = useState<Session>()

  useEffect(() => {
    if (id === undefined) {
      alert("Session not found, or insufficient permissions")
      moveToPage(Path.Dashboard)
      return
    }

    database
      .getSessions([parseInt(id)])
      .then(sessions => {
        if (sessions.length === 0) {
          alert("Session not found, or insufficient permissions")
          moveToPage(Path.Dashboard)
          return
        } else {
          setSession(sessions[0])
        }
      })
  }, [id])

  return (
    <>
      <Container my="md" size="xl">
        {session &&
          <Grid>
            <Grid.Col xs={12}>
              <Header session={session} />
            </Grid.Col>

            <Grid.Col xs={12} md={5}>
              <Config session={session} />
            </Grid.Col>

            <Grid.Col xs={12} md={7}>
              <Ontology session={session} />
            </Grid.Col>

            <Grid.Col xs={12} md={5}>
              <Documents session={session} />
            </Grid.Col>
          </Grid>
        }
      </Container>
    </>
  )
}

export default Setup
