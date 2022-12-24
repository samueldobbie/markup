import { Group, Button, ActionIcon, Text, FileButton, Card } from "@mantine/core"
import { IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { WorkspaceConfig, database } from "storage/database/Database"
import { SectionProps } from "./Setup"

function ConfigTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [configs, setConfigs] = useState<WorkspaceConfig[]>([])

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(setConfigs)
  }, [workspace.id])

  useEffect(() => {
    if (file === null) return

    const func = async () => {
      database
        .addWorkspaceConfig(workspace.id, file)
        .then(insertedConfig => {
          setFile(null)
          setConfigs([insertedConfig])
        })
    }

    func()
  }, [configs, file, workspace.id])

  useEffect(() => {
    if (setWorkspaceStatus === undefined) return

    if (configs.length === 0 && workspaceStatus.hasConfig) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasConfig: false,
      })
    } else if (configs.length > 0 && !workspaceStatus.hasConfig) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasConfig: true,
      })
    }
  }, [configs, workspaceStatus, setWorkspaceStatus])

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withBorder={false}
        emptyState="Upload or create a config"
        borderRadius={5}
        sx={{ minHeight: "500px" }}
        records={configs}
        rowExpansion={{
          content: (config) => (
            <Text
              p={20}
              mb={20}
              color="dimmed"
              lineClamp={4}
              sx={{
                whiteSpace: "pre-line",
                overflowX: "hidden",
                width: "500px", // remove hardcoded
              }}
            >
              {config.record.content}
            </Text>
          )
        }}
        columns={[
          {
            accessor: "name",
            title: <Text size={16}>Config</Text>,
          },
          {
            accessor: "actions",
            title: (
              <Group spacing={4} position="right" noWrap>
                <Button variant="subtle">
                  Create config
                </Button>

                <FileButton onChange={setFile} accept="plain/text">
                  {(props) => (
                    <Button {...props}>
                      Upload config
                    </Button>
                  )}
                </FileButton>
              </Group>
            ),
            textAlignment: "right",
            render: (config) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon color="primary">
                  <IconTrash
                    size={16}
                    style={{ color: "rgb(217 138 138)" }}
                    onClick={(event) => {
                      event.stopPropagation()

                      database
                        .deleteWorkspaceConfig(config.id)
                        .then(() => setConfigs([]))
                        .catch(alert)
                    }}
                  />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default ConfigTable
