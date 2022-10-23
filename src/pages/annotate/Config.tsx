import { ActionIcon, Button, Card, Collapse, Group, Radio, Select, Text } from "@mantine/core"
import { IconChevronDown, IconChevronUp } from "@tabler/icons"
import { database, WorkspaceConfig } from "pages/database/Database"
import { useState, useEffect } from "react"
import { SectionProps } from "./Interfaces"
import { Attribute, parseConfig } from "./Parse"

function Config({ workspace }: SectionProps) {
  const [config, setConfig] = useState<WorkspaceConfig>()
  const [entities, setEntities] = useState<string[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [activeEntity, setActiveEntity] = useState("")
  const [activeAttributes, setActiveAttributes] = useState<Attribute[]>([])
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)

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

  useEffect(() => {
    setActiveAttributes(attributes.filter(i => (
      i.isGlobal || i.targetEntity === activeEntity
    )))

    console.log(activeEntity)
    console.log(activeAttributes)
  }, [activeEntity, attributes])

  return (
    <Card withBorder radius="md" p="xl">
      <Group mb={20}>
        <Group position="left" noWrap>
          <Text size={"sm"}>
            Select an entity
          </Text>

          <ActionIcon onClick={() => setEntitySectionOpen(!entitySectionOpen)}>
            {entitySectionOpen && <IconChevronDown />}
            {!entitySectionOpen && <IconChevronUp />}
          </ActionIcon>
        </Group>

        <Collapse in={entitySectionOpen}>
          <Group mb={20}>
            <Radio.Group
              name="entities"
              orientation="vertical"
              onChange={setActiveEntity}
              spacing="xs"
            >
              {entities?.map((entity) => (
                <Radio
                  label={entity}
                  value={entity}
                />
              ))}
            </Radio.Group>
          </Group>
        </Collapse>
      </Group>

      <Group mb={20}>
        <Group position="left" noWrap>
          <Text size={"sm"}>
            Add attributes
          </Text>

          <ActionIcon onClick={() => setAttributeSectionOpen(!attributeSectionOpen)}>
            {attributeSectionOpen && <IconChevronDown />}
            {!attributeSectionOpen && <IconChevronUp />}
          </ActionIcon>
        </Group>

        <Collapse in={attributeSectionOpen}>
          <Group mb={20}>
            <Radio.Group
              name="attributes"
              orientation="vertical"
              spacing="xs"
            >
              {activeAttributes.map((attribute) => (
                <Select
                  data={attribute.options}
                  placeholder={attribute.name}
                  size={"xs"}
                />
              ))}
            </Radio.Group>
          </Group>
        </Collapse>
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

export default Config
