import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import Documents from "./Documents"
import Header from "./Header"
import Configs from "./Config"

function Setup() {
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
    <>
      <Container my="md" size="xl">
        {workspace &&
          <Grid>
            <Grid.Col xs={12}>
              <Header workspace={workspace} />
            </Grid.Col>

            <Grid.Col xs={12} md={5}>
              <Configs workspace={workspace} />
            </Grid.Col>

            <Grid.Col xs={12} md={7}>
              <Documents workspace={workspace} />
            </Grid.Col>
          </Grid>
        }
      </Container>
    </>
  )
}

export default Setup
