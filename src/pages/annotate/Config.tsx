import { ActionIcon, Button, Card, Collapse, Divider, Grid, Group, MultiSelect, Radio, ScrollArea, Text } from "@mantine/core"
import { IconEye, IconEyeOff } from "@tabler/icons"
import { database } from "storage/database/Database"
import { useState, useEffect } from "react"
import { useRecoilState } from "recoil"
import { activeEntityState, entityColoursState, populatedAttributeState, selectedOntologyConceptsState } from "storage/state/Annotate"
import { SectionProps } from "./Interfaces"
import { Attribute, parseConfig } from "./Parse"
import distinctColors from "distinct-colors"
import { OntologyConcept } from "pages/dashboard/OntologyTable"

interface Data {
  label: string
  value: string
}

function Config({ workspace }: SectionProps) {
  const [entities, setEntities] = useState<string[]>([])
  const [entityColours, setEntityColours] = useRecoilState(entityColoursState)
  const [activeEntity, setActiveEntity] = useRecoilState(activeEntityState)
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)

  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [shownAttributes, setShownAttributes] = useState<Attribute[]>([])
  const [populatedAttributes, setPopulatedAttributes] = useRecoilState(populatedAttributeState)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)

  const [ontologySectionOpen, setOntologySectionOpen] = useState(true)
  const [availableOntologies, setAvailableOntologies] = useState<Data[]>([])
  const [selectedOntologyIds, setSelectedOntologyIds] = useState<string[]>([])
  const [availableOntologyConcepts, setAvailableOntologyConcepts] = useState<OntologyConcept[]>([])
  const [selectedOntologyConcepts, setSelectedOntologyConcepts] = useRecoilState(selectedOntologyConceptsState)

  const clearPopulatedAttributes = () => {
    setPopulatedAttributes({})
  }

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
    database
      .getOntologies()
      .then((ontologies) => {
        const data = ontologies.map(ontology => ({
          label: ontology.name,
          value: ontology.id,
        }))

        setAvailableOntologies(data)
      })
  }, [])

  useEffect(() => {
    database
      .getOntologyConcepts(selectedOntologyIds)
      .then(setAvailableOntologyConcepts)
  }, [selectedOntologyIds])

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
    <Card shadow="xs" radius={5} p="xl">
      <ScrollArea scrollbarSize={0} sx={{ height: "76vh" }}>
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
                            backgroundColor: entityColours[entity],
                            color: "#333333",
                            cursor: "pointer",
                            userSelect: "none",
                            borderRadius: 5,
                            padding: 5,
                          }}
                        >
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
            <Group position="apart">
              <Title
                text="Add attributes"
                open={attributeSectionOpen}
                setOpen={setAttributeSectionOpen}
              />

              <Button
                variant="subtle"
                onClick={clearPopulatedAttributes}
              >
                Clear
              </Button>
            </Group>
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
                  <Grid sx={{ width: "100%" }}>
                    {shownAttributes.map((attribute, index) => (
                      <Grid.Col xs={12}>
                        <MultiSelect
                          maxSelectedValues={100}
                          data={attribute.options}
                          placeholder={attribute.name}
                          size="sm"
                          key={index + attribute.name}
                          onChange={(value) => {
                            const copy = { ...populatedAttributes }

                            if (value.length > 0) {
                              copy[attribute.name] = value
                            } else if (Object.keys(copy).includes(attribute.name)) {
                              delete copy[attribute.name]
                            }

                            setPopulatedAttributes(copy)
                          }}
                          searchable
                          clearable
                          creatable
                          getCreateLabel={(query) => `+ Create ${query}`}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Group>
              }
            </Collapse>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Group position="apart">
              <Title
                text="Map to ontology"
                open={ontologySectionOpen}
                setOpen={setOntologySectionOpen}
              />

              <Button
                variant="subtle"
                onClick={clearPopulatedAttributes}
              >
                Clear
              </Button>
            </Group>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Collapse in={ontologySectionOpen}>
              <Group mb={20}>
                <Grid sx={{ width: "100%" }}>
                  <Grid.Col xs={12}>
                    <MultiSelect
                      maxSelectedValues={100}
                      data={availableOntologies}
                      placeholder="Ontology"
                      size="sm"
                      searchable
                      clearable
                      creatable
                      onChange={(ontologyIds) => setSelectedOntologyIds(ontologyIds)}
                    />
                  </Grid.Col>

                  <Grid.Col xs={12}>
                    <MultiSelect
                      maxSelectedValues={100}
                      data={availableOntologyConcepts.map(concept => `${concept.name} (${concept.code})`)}
                      placeholder="Concept"
                      size="sm"
                      searchable
                      clearable
                      creatable
                      // onChange={(concepts) => setSelectedOntologyConcepts(concepts)}
                    />
                  </Grid.Col>
                </Grid>
              </Group>
            </Collapse>
          </Grid.Col>
        </Grid>
      </ScrollArea>
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
    <Group
      position="left"
      noWrap
      onClick={() => setOpen(!open)}
      sx={{ cursor: "pointer" }}
    >
      <ActionIcon>
        {open && <IconEye style={{ opacity: 0.8 }} size={18} />}
        {!open && <IconEyeOff style={{ opacity: 0.8 }} size={18} />}
      </ActionIcon>

      <Text size="md">
        {text}
      </Text>

      <Divider mt={10} />
    </Group>
  )
}

export default Config
