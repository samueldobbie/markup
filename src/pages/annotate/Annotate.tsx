import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "pages/database/Database"
import Output from "./Output"
import Config from "./Config"
import Document from "./Document"

function Annotate() {
  const { id } = useParams()

  const [workspace, setWorkspace] = useState<Workspace>()

  useEffect(() => {
    if (id === undefined) {
      alert("Workspace doesn't exist, or insufficient permissions")
      moveToPage(Path.Dashboard)
      return
    }

    database
      .getWorkspaces([id])
      .then(workspaces => {
        if (workspaces.length === 0) {
          alert("Workspace doesn't exist, or insufficient permissions")
          moveToPage(Path.Dashboard)
          return
        } else {
          setWorkspace(workspaces[0])
        }
      })
  }, [id])

  return (
    <Container my="md" size="xl">
      {workspace &&
        <Grid>
          <Grid.Col xs={3}>
            <Config />
          </Grid.Col>

          <Grid.Col xs={6}>
            <Document />
          </Grid.Col>

          <Grid.Col xs={3}>
            <Output />
          </Grid.Col>
        </Grid>
      }
    </Container>
  )
}

export default Annotate
