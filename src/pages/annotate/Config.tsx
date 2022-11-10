import { ActionIcon, Card, Collapse, Grid, Group, MultiSelect, Radio, Text } from "@mantine/core"
import { IconEye, IconEyeOff } from "@tabler/icons"
import { database } from "pages/database/Database"
import { useState, useEffect } from "react"
import { useRecoilState } from "recoil"
import { activeEntityState, entityColoursState, populatedAttributeState } from "store/Annotate"
import { SectionProps } from "./Interfaces"
import { Attribute, parseConfig } from "./Parse"
import distinctColors from "distinct-colors"

function Config({ workspace }: SectionProps) {
  const [entities, setEntities] = useState<string[]>([])
  const [entityColours, setEntityColours] = useRecoilState(entityColoursState)
  const [activeEntity, setActiveEntity] = useRecoilState(activeEntityState)
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)

  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [shownAttributes, setShownAttributes] = useState<Attribute[]>([])
  const [populatedAttributes, setPopulatedAttributes] = useRecoilState(populatedAttributeState)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(configs => {
        if (configs.length > 0) {
          const config = configs[0]
          const { entities, attributes } = parseConfig(config)

          setEntities(entities)
          setAttributes(attributes)
        } else {
          alert("Failed to load workspace config. Try refreshing the page.")
        }
      })
      .catch(alert)
  }, [workspace.id])

  useEffect(() => {
    if (entities.length > 0) {
      setActiveEntity(entities[0])
    }
  }, [entities, setActiveEntity])

  useEffect(() => {
    const colours: Record<string, string> = {}

    const palette = distinctColors({
      count: entities.length,
      lightMin: 80,
    })

    entities.forEach((entity, index) => {
      colours[entity] = palette[index].hex()
    })

    setEntityColours(colours)
  }, [entities, setEntityColours])

  useEffect(() => {
    const attributesToShow = attributes.filter(attribute => (
      attribute.isGlobal ||
      attribute.targetEntity === activeEntity
    ))

    setShownAttributes(attributesToShow)
  }, [activeEntity, attributes])

  return (
    <Card withBorder radius={2} p="xl">
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
                      <span
                        onClick={() => setActiveEntity(entity)}
                        style={{
                          color: "#333333",
                          fontWeight: "bold",
                          cursor: "pointer",
                          paddingRight: 10,
                          userSelect: "none",
                        }}
                      >
                        {entity}
                      </span>}
                    value={entity}
                    key={index}
                    sx={{
                      backgroundColor: entityColours[entity],
                      padding: 3,
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
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
            {shownAttributes.length === 0 &&
              <Text color="dimmed">
                Select entity to see attributes
              </Text>
            }

            {shownAttributes.length > 0 &&
              <Group mb={20}>
                <Grid>
                  {shownAttributes.map((attribute, index) => (
                    <Grid.Col md={12} lg={6}>
                      <MultiSelect
                        data={attribute.options}
                        placeholder={attribute.name}
                        size="xs"
                        key={index + attribute.name}
                        onChange={(value) => {
                          const copy = { ...populatedAttributes }
                          copy[attribute.name] = value
                          setPopulatedAttributes(copy)
                        }}
                        searchable
                        clearable
                        creatable
                      />
                    </Grid.Col>
                  ))}
                </Grid>
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
      <ActionIcon onClick={() => setOpen(!open)}>
        {open && <IconEye style={{ opacity: 0.25 }} size={18} />}
        {!open && <IconEyeOff style={{ opacity: 0.25 }} size={18} />}
      </ActionIcon>

      <Text size="sm">
        {text}
      </Text>
    </Group>
  )
}

export default Config
