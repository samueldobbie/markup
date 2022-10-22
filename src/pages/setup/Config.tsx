import { Group, Button, ActionIcon, Text, FileButton } from "@mantine/core"
import { IconTrash, IconEdit } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { WorkspaceConfig, database } from "pages/database/Database"
import { SectionProps } from "./Interfaces"

function Configs({ workspace }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [config, setConfig] = useState<WorkspaceConfig[]>([])

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(setConfig)
  }, [workspace.id])

  useEffect(() => {
    if (file === null) return

    const func = async () => {
      database
        .addWorkspaceConfig(workspace.id, file)
        .then(insertedConfig => {
          setFile(null)
          setConfig([insertedConfig])
        })
    }

    func()
  }, [config, file, workspace.id])

  return (
    <DataTable
      withBorder
      highlightOnHover
      emptyState="Upload or create a config"
      borderRadius="md"
      sx={{ minHeight: "500px" }}
      records={config}
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
                Create
              </Button>

              <FileButton onChange={setFile} accept="plain/text">
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                  >
                    Upload config
                  </Button>
                )}
              </FileButton>
            </Group>
          ),
          textAlignment: "right",
          render: (config) => (
            <Group spacing={4} position="right" noWrap>
                <ActionIcon color="red" variant="light">
                <IconTrash
                  size={16}
                  onClick={() => {
                    if (config) {
                      database.deleteWorkspaceConfig(config.id)
                      setConfig([])
                    }
                  }}
                />
              </ActionIcon>

              <ActionIcon color="blue">
                <IconEdit size={16} />
              </ActionIcon>
            </Group>
          ),
        },
      ]}
    />
  )
}

export default Configs
