import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import Output from "./Output"
import Document from "./Document"
import Config from "./Config"

export interface SectionProps {
  workspace: Workspace
}

function Annotate() {
  const { id } = useParams()

  const [workspace, setWorkspace] = useState<Workspace>()

  useEffect(() => {
    if (id === undefined) {
      console.error("Workspace doesn't exist, or insufficient permissions")
      moveToPage(Path.Dashboard)
      return
    }

    database
      .getWorkspace(id)
      .then(workspaces => {
        if (workspaces.length === 0) {
          console.error("Workspace doesn't exist, or insufficient permissions")
          moveToPage(Path.Dashboard)
        } else {
          setWorkspace(workspaces[0])
        }
      })
      .catch(() => {
        console.error("Failed to load workspace. Please try again later.")
        moveToPage(Path.Dashboard)
      })
  }, [id])

  return (
    <Container sx={{ width: "98%", maxWidth: "98%" }}>
      {workspace &&
        <Grid>
          <Grid.Col md={3}>
            <Config workspace={workspace} />
          </Grid.Col>

          <Grid.Col md={6}>
            <Document workspace={workspace} />
          </Grid.Col>

          <Grid.Col md={3}>
            <Output workspace={workspace} />
          </Grid.Col>
        </Grid>
      }
    </Container>
  )
}

export default Annotate
