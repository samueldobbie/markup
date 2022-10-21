import { Group, Button, ActionIcon, Text, FileButton } from "@mantine/core"
import { IconTrash, IconEdit } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { Config, database } from "utils/Database"
import { SectionProps } from "./Interfaces"

function Configs({ session }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [config, setConfig] = useState<Config>()

  useEffect(() => {
    database
      .getConfig(session.id)
      .then(setConfig)
  }, [session.id])

  useEffect(() => {
    if (file === null) return

    const func = async () => {
      database
        .addConfig(session.id, file)
        .then(insertedConfig => {
          setFile(null)
          setConfig(insertedConfig)
        })
    }

    func()
  }, [config, file, session.id])

  return (
    <DataTable
      withBorder
      highlightOnHover
      emptyState="Upload or create a config"
      borderRadius="md"
      sx={{ minHeight: "500px" }}
      records={[config]}
      columns={[
        { accessor: "name", title: <Text size={16}>Config</Text> },
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
              <ActionIcon color="red">
                <IconTrash
                  size={16}
                  onClick={() => {
                    if (config) {
                      database.deleteConfig(config.id)
                      setConfig(undefined)
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
