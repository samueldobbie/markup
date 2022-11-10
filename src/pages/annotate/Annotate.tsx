import { useParams } from "react-router-dom"
import { Container, Grid, ScrollArea } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
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
    <Container sx={{ width: "95%", maxWidth: "95%" }}>
      {workspace &&
        <Grid>
          <Grid.Col xs={3}>
            <ScrollArea>
              <Config workspace={workspace} />
            </ScrollArea>
          </Grid.Col>

          <Grid.Col xs={6}>
            <ScrollArea>
              <Document workspace={workspace} />
            </ScrollArea>
          </Grid.Col>

          <Grid.Col xs={3}>
            <ScrollArea>
              <Output workspace={workspace} />
            </ScrollArea>
          </Grid.Col>
        </Grid>
      }
    </Container>
  )
}

export default Annotate
