import { ActionIcon, Button, Card, Collapse, Grid, Group, MultiSelect, Radio, ScrollArea, Select, Text } from "@mantine/core"
import { IconCaretDown, IconCaretRight, IconInfoCircle } from "@tabler/icons"
import { database } from "storage/database/Database"
import { useState, useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { activeEntityState, configState, entityColoursState, populatedAttributeState, activeOntologyConceptsState, activeTutorialStepState } from "storage/state/Annotate"
import { SectionProps } from "./Annotate"
import { parseConfig } from "pages/annotate/ParseConfig"
import distinctColors from "distinct-colors"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import { DEMO_IDS } from "utils/Demo"
import notify from "utils/Notifications"

interface Data {
  label: string
  value: string
}

interface Attribute {
  name: string
  options: string[]
  isGlobal: boolean
  targetEntity?: string
  allowCustomValues?: boolean
}

function Config({ workspace }: SectionProps) {
  const setConfig = useSetRecoilState(configState)

  const [entities, setEntities] = useState<string[]>([])
  const [entityColours, setEntityColours] = useRecoilState(entityColoursState)
  const [activeEntity, setActiveEntity] = useRecoilState(activeEntityState)
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)
  const [activeTutorialStep, setActiveTutorialStep] = useRecoilState(activeTutorialStepState)

  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [shownAttributes, setShownAttributes] = useState<Attribute[]>([])
  const [populatedAttributes, setPopulatedAttributes] = useRecoilState(populatedAttributeState)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)

  const [ontologySectionOpen, setOntologySectionOpen] = useState(true)
  const [availableOntologies, setAvailableOntologies] = useState<Data[]>([])
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(null)
  const [selectedOntologyConcepts, setSelectedOntologyConcepts] = useState<OntologyConcept[]>([])
  const setActiveOntologyConcept = useSetRecoilState(activeOntologyConceptsState)
  const [isDemoSession, setIsDemoSession] = useState(false)

  const clearPopulatedAttributes = () => {
    setPopulatedAttributes({})
  }

  useEffect(() => {
    setIsDemoSession(DEMO_IDS.includes(workspace.id))
  }, [workspace.id])

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(configs => {
        if (configs.length > 0) {
          const config = parseConfig(configs[0].content)
          const attributes: Attribute[] = []

          config.entities.forEach((entity) => {
            entity.attributes.forEach((attribute) => {
              attributes.push({
                name: attribute.name,
                options: attribute.values,
                targetEntity: entity.name,
                allowCustomValues: attribute.allowCustomValues,
                isGlobal: false,
              })
            })
          })

          config.globalAttributes.forEach((attribute) => {
            attributes.push({
              name: attribute.name,
              options: attribute.values,
              allowCustomValues: attribute.allowCustomValues,
              isGlobal: true,
            })
          })

          setConfig(config)
          setEntities(config.entities.map(e => e.name))
          setAttributes(attributes)
        } else {
          notify.error("Failed to load workspace config.")
        }
      })
      .catch(() => notify.error("Failed to load workspace config."))
  }, [setConfig, workspace.id])

  // useEffect(() => {
  //   if (entities.length > 0) {
  //     setActiveEntity(entities[0])
  //   }
  // }, [entities, setActiveEntity])

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
      .catch(() => notify.error("Failed to load ontologies."))
  }, [])

  useEffect(() => {
    if (selectedOntologyId == null) {
      setSelectedOntologyConcepts([])
      setActiveOntologyConcept({
        name: "",
        code: "",
      })
      return
    }

    database
      .getOntologyConcepts(selectedOntologyId)
      .then(setSelectedOntologyConcepts)
      .catch(() => notify.error("Failed to load ontology concepts."))
  }, [selectedOntologyId, setActiveOntologyConcept])

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
              text="Select entity"
              description="Select the entity you want to annotate."
              open={entitySectionOpen}
              setOpen={setEntitySectionOpen}
            />
          </Grid.Col>

          <Grid.Col xs={12}>
            <Collapse in={entitySectionOpen}>
              <Group mb={20}>
                <Radio.Group
                  name="entities"
                  orientation="horizontal"
                  onChange={(e) => {
                    setActiveEntity(e)

                    if (activeTutorialStep === 0) {
                      setActiveTutorialStep(1)
                    }
                  }}
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
              {activeEntity === "" && shownAttributes.length === 0 &&
                <Text color="dimmed">
                  Select entity to see attributes
                </Text>
              }

              {activeEntity !== "" && shownAttributes.length === 0 &&
                <Text color="dimmed">
                  Selected entity has no attributes
                </Text>
              }

              {shownAttributes.length > 0 &&
                <Group mb={20}>
                  <Grid sx={{ width: "100%" }}>
                    {shownAttributes.map((attribute, index) => {
                      return (
                        <Grid.Col xs={12} key={index}>
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
                            creatable={attribute.allowCustomValues}
                            getCreateLabel={(query) => `+ Create ${query}`}
                          />
                        </Grid.Col>
                      )
                    })}
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
              {isDemoSession &&
                <Text color="dimmed">
                  Predictive mappings are disabled in demo sessions.
                </Text>
              }

              {!isDemoSession &&
                <Group mb={20}>
                  <Grid sx={{ width: "100%" }}>
                    <Grid.Col xs={12}>
                      <Select
                        data={availableOntologies}
                        placeholder="Ontology"
                        size="sm"
                        searchable
                        onChange={setSelectedOntologyId}
                      />
                    </Grid.Col>

                    <Grid.Col xs={12}>
                      <Select
                        data={selectedOntologyConcepts.map(concept => {
                          return {
                            label: `${concept.name} (${concept.code})`,
                            value: concept.code,
                          }
                        })}
                        placeholder="Concept"
                        size="sm"
                        searchable
                        clearable
                        creatable
                        onChange={(code) => {
                          const name = selectedOntologyConcepts.find(concept => concept.code === code)?.name

                          if (code && name) {
                            setActiveOntologyConcept({
                              code,
                              name,
                            })
                          } else {
                            setActiveOntologyConcept({
                              code: "",
                              name: "",
                            })
                          }
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                </Group>
              }
            </Collapse>
          </Grid.Col>
        </Grid>
      </ScrollArea>
    </Card>
  )
}

interface TitleProps {
  text: string
  description?: string
  open: boolean
  setOpen: (v: boolean) => void
}

function Title({ text, description, open, setOpen }: TitleProps) {
  return (
    <>
      <Group
        position="left"
        onClick={() => setOpen(!open)}
        sx={{ cursor: "pointer" }}
        noWrap
      >
        <ActionIcon mr={-10}>
          {open && <IconCaretDown style={{ opacity: 0.8 }} size={18} />}
          {!open && <IconCaretRight style={{ opacity: 0.8 }} size={18} />}
        </ActionIcon>

        <Text size="md">
          {text}
        </Text>

        <ActionIcon ml={-15}>
          {/* <Tooltip label={description}> */}
            <IconInfoCircle style={{ opacity: 0.6 }} size={18} />
          {/* </Tooltip> */}
        </ActionIcon>
      </Group>
    </>
  )
}

export default Config
