import { ActionIcon, Card, Collapse, Grid, Group, Radio, Select, Text } from "@mantine/core"
import { IconChevronDown, IconChevronUp } from "@tabler/icons"
import { database, WorkspaceConfig } from "pages/database/Database"
import { useState, useEffect } from "react"
import { useRecoilState } from "recoil"
import { activeEntityState, entityColoursState } from "store/Annotate"
import { SectionProps } from "./Interfaces"
import { Attribute, parseConfig } from "./Parse"
import distinctColors from "distinct-colors"

function Config({ workspace }: SectionProps) {
  const [config, setConfig] = useState<WorkspaceConfig>()
  const [entities, setEntities] = useState<string[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [activeEntity, setActiveEntity] = useRecoilState(activeEntityState)
  const [entityColours, setEntityColours] = useRecoilState(entityColoursState)
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
    if (entities.length > 0) {
      setActiveEntity(entities[0])
    }
  }, [entities, setActiveEntity])

  useEffect(() => {
    const colours: Record<string, string> = {}

    const palette = distinctColors({
      count: entities.length,
      lightMin: 60,
    })

    entities.forEach((entity, index) => {
      colours[entity] = palette[index].hex()
    })

    setEntityColours(colours)
  }, [entities, setEntityColours])

  useEffect(() => {
    if (activeEntity === "") {
      setActiveAttributes([])
      return
    }

    setActiveAttributes(attributes.filter(i => (
      i.isGlobal || i.targetEntity === activeEntity
    )))
  }, [activeEntity, attributes])

  return (
    <Card withBorder radius="md" p="xl">
      <Grid>
        <Grid.Col xs={12}>
          <Title
            text="Select an entity"
            open={entitySectionOpen}
            setOpen={setEntitySectionOpen}
          />
        </Grid.Col>

        <Grid.Col xs={12}>
          <Collapse in={entitySectionOpen}>
            <Group mb={20}>
              <Radio.Group
                name="entities"
                orientation="vertical"
                onChange={setActiveEntity}
                spacing="xs"
                value={activeEntity}
              >
                {entities?.map((entity, index) => (
                  <Radio
                    label={
                      <span style={{
                        backgroundColor: entityColours[entity],
                        padding: 3,
                        borderRadius: 5,
                        color: "#333333",
                      }}>
                        {entity}
                      </span>}
                    value={entity}
                    key={index}
                  />
                ))}
              </Radio.Group>
            </Group>
          </Collapse>
        </Grid.Col>

        <Grid.Col xs={12}>
          <Title
            text="Add attributes"
            open={attributeSectionOpen}
            setOpen={setAttributeSectionOpen}
          />
        </Grid.Col>

        <Grid.Col xs={12}>
          <Collapse in={attributeSectionOpen}>
            {activeAttributes.length === 0 &&
              <Text color="dimmed">
                Select entity to see attributes
              </Text>
            }

            {activeAttributes.length > 0 &&
              <Group mb={20}>
                {activeAttributes.map((attribute, index) => (
                  <Select
                    data={attribute.options}
                    placeholder={attribute.name}
                    size="xs"
                    key={index + attribute.name}
                    searchable
                  />
                ))}
              </Group>
            }
          </Collapse>
        </Grid.Col>
      </Grid>
    </Card>
  )
}

interface TitleProps {
  text: string
  open: boolean
  setOpen: (v: boolean) => void
}

function Title({ text, open, setOpen }: TitleProps) {
  return (
    <Group position="left" noWrap>
      <Text size={"sm"}>
        {text}
      </Text>

      <ActionIcon onClick={() => setOpen(!open)}>
        {open && <IconChevronDown />}
        {!open && <IconChevronUp />}
      </ActionIcon>
    </Group>
  )
}

export default Config
