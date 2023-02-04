import { useParams } from "react-router-dom"
import { Container, Grid } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { useEffect, useState } from "react"
import { database, Workspace } from "storage/database/Database"
import ConfigTable from "./ConfigTable"
import DocumentTable from "./DocumentTable"
import Header from "./Header"
import GuidelinesTable from "./GuidelinesTable"
import notify from "utils/Notifications"

interface WorkspaceStatus {
  hasConfig: boolean
  hasDocument: boolean
}

export interface SectionProps {
  workspace: Workspace
  workspaceStatus: WorkspaceStatus
  setWorkspaceStatus?: (status: WorkspaceStatus) => void
}

function Setup() {
  const { id } = useParams()

  const [workspace, setWorkspace] = useState<Workspace>()
  const [workspaceStatus, setWorkspaceStatus] = useState({
    hasConfig: false,
    hasDocument: false,
  })

  useEffect(() => {
    if (id === undefined) {
      notify.error("Workspace doesn't exist, or insufficient permissions")
      moveToPage(Path.Dashboard)
      return
    }

    database
      .getWorkspace(id)
      .then(workspaces => {
        if (workspaces.length === 0) {
          notify.error("Workspace doesn't exist, or insufficient permissions")
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
              <Header
                workspace={workspace}
                workspaceStatus={workspaceStatus}
              />
            </Grid.Col>

            <Grid.Col xs={12} md={5}>
              <Grid>
                <Grid.Col xs={12}>
                  <ConfigTable
                    workspace={workspace}
                    workspaceStatus={workspaceStatus}
                    setWorkspaceStatus={setWorkspaceStatus}
                  />
                </Grid.Col>

                <Grid.Col xs={12}>
                  <GuidelinesTable
                    workspace={workspace}
                    workspaceStatus={workspaceStatus}
                    setWorkspaceStatus={setWorkspaceStatus}
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>

            <Grid.Col xs={12} md={7}>
              <DocumentTable
                workspace={workspace}
                workspaceStatus={workspaceStatus}
                setWorkspaceStatus={setWorkspaceStatus}
              />
            </Grid.Col>
          </Grid>
        }
      </Container>
    </>
  )
}

export default Setup
