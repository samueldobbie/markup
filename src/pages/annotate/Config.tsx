import { Button, Card, Group, Select, Text } from "@mantine/core"
import { database, WorkspaceConfig } from "pages/database/Database"
import { useState, useEffect } from "react"
import { SectionProps } from "./Interfaces"

function Config({ workspace }: SectionProps) {
  const [config, setConfig] = useState<WorkspaceConfig>()
  const [entities, setEntities] = useState<string[]>()
  const [attributes, setAttributes] = useState<string[]>()

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(configs => setConfig(configs[0]))
      .catch(alert)
  }, [workspace.id])

  useEffect(() => {
    if (config) {
      const { entities, attributes } = parseConfig(config)

      setEntities(entities)
      setAttributes(attributes)
    }
  }, [config])

  return (
    <Card withBorder radius="md" p="xl">
      <Group mb={20}>
        <Text color="dimmed">
          Entities
        </Text>

        <Select data={[]} />
        <Select data={[]} />
        <Select data={[]} />
      </Group>

      <Group mb={20}>
        <Text color="dimmed">
          Attributes
        </Text>

        <Select data={[]} />
        <Select data={[]} />
        <Select data={[]} />
      </Group>

      <Group noWrap>
        <Button>
          Add annotation
        </Button>

        <Button variant="subtle">
          Export
        </Button>
      </Group>
    </Card>
  )
}

function parseConfig(config: WorkspaceConfig) {
  return {
    entities: [],
    attributes: [],
  }
}

export default Config
