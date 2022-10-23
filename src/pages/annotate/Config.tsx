import { Button, Card, Group, Radio, Select, Text } from "@mantine/core"
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
        <Radio.Group
          name="entities"
          orientation="vertical"
          label="Select an entity"
          withAsterisk
        >
          {entities?.map((entity) => (
            <Radio label={entity} value={entity} />
          ))}
        </Radio.Group>
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
    entities: parseEntities(config.content),
    attributes: [], // parseAttributes(config.content)
  }
}

function parseEntities(content: string): string[] {
  const entities: string[] = []

  const lines = content.split("\n")
  let takeNextLine = false

  lines.forEach((line) => {
    const isHeader = isSectionHeader(line)

    if (isHeader && isEntitySectionHeader(line)) {
      takeNextLine = true
    } else if (isHeader) {
      takeNextLine = false
    } else if (takeNextLine) {
      const entity = line.trim()

      if (entity) {
        entities.push(entity)
      }
    }
  })

  return entities
}

function isSectionHeader(line: string): boolean {
  return (
    line.length >= 3 &&
    line[0] === "[" &&
    line[line.length - 1] === "]"
  )
}

function isEntitySectionHeader(line: string): boolean {
  return line.slice(1, line.length - 1).toLocaleLowerCase() === "entities"
}

// function parseAttributeValues(attributes: string[]): IAttribute[] {
//   const parsedAttributes: IAttribute[] = []

//   attributes.forEach((attribute: string) => {
//     const attributeName = attribute
//       .split(Config.TargetEntity)[0]
//       .trim()

//     const attributeOptions = attribute
//       .split(Config.AttributeValue)[1]
//       .trim()
//       .split(Config.AttributeValueSeparator)

//     const targetEntity = attribute
//       .split(Config.TargetEntity)[1]
//       .split(Config.TargetEntitySeparator)[0]
//       .trim()

//     const isGlobal = targetEntity.toUpperCase() === Config.GlobalAttributeKey

//     parsedAttributes.push({
//       name: attributeName,
//       options: attributeOptions,
//       targetEntity: targetEntity,
//       isGlobal: isGlobal,
//     })
//   })

//   return parsedAttributes
// }

export default Config
