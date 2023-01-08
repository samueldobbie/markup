import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import Output from "./Output"
import Document from "./Document"
import Config from "./Config"

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
      .getWorkspace(id)
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
    <Container sx={{ width: "95%", maxWidth: "95%" }}>
      {workspace &&
        <Grid>
          <Grid.Col xs={3}>
            <Config workspace={workspace} />
          </Grid.Col>

          <Grid.Col xs={6}>
            <Document workspace={workspace} />
          </Grid.Col>

          <Grid.Col xs={3}>
            <Output workspace={workspace} />
          </Grid.Col>
        </Grid>
      }
    </Container>
  )
}

export default Annotate
