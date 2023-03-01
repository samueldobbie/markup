import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import Output from "./Output"
import Document from "./Document"
import Config from "./Config"
import notify from "utils/Notifications"
import InvalidWorkspace from "pages/error/InvalidWorkspace"
import Tutorial from "./Tutorial"
import { DEMO_IDS } from "utils/Demo"

export interface SectionProps {
  workspace: Workspace
}

function Annotate() {
  const { id } = useParams()

  const [invalidWorkspace, setInvalidWorkspace] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace>()
  const [isDemoWorkspace, setIsDemoWorkspace] = useState(false)

  useEffect(() => {
    if (id === undefined) {
      notify.error("Workspace doesn't exist, or insufficient permissions")
      setInvalidWorkspace(true)
      return
    }

    database
      .getWorkspace(id)
      .then(workspaces => {
        if (workspaces.length === 0) {
          notify.error("Workspace doesn't exist, or insufficient permissions")
          setInvalidWorkspace(true)
        } else {
          setWorkspace(workspaces[0])
        }
      })
      .catch(() => {
        notify.error("Failed to load workspace.")
        moveToPage(Path.Dashboard)
      })
  }, [id])

  useEffect(() => {
    if (id) {
      setIsDemoWorkspace(DEMO_IDS.includes(id))
    }
  }, [id])

  return (
    <>
      {invalidWorkspace &&
        <InvalidWorkspace />  
      }

      {!invalidWorkspace &&
        <Container sx={{ width: "98%", maxWidth: "98%" }}>
          {workspace &&
            <Grid>
              <Grid.Col xs={12} hidden={!isDemoWorkspace}>
                <Tutorial />
              </Grid.Col>

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
      }
    </>
  )
}

export default Annotate
