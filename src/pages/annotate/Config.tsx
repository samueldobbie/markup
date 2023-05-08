import { Button, Card, Collapse, Container, Grid, Group, ScrollArea, Select, Text } from "@mantine/core"
import { RawAnnotation, database } from "storage/database/Database"
import { useState, useEffect } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { activeEntityState, activeOntologyConceptsState, activeTutorialStepState, annotationsState, configState, documentIndexState, documentsState, entityColoursState, populatedAttributeState, proposedAnnotationState } from "storage/state/Annotate"
import { SectionProps } from "./Annotate"
import { parseJsonConfig } from "pages/annotate/ParseJsonConfig"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import notify from "utils/Notifications"
import Title from "components/title/Title"
import EntityConfig from "components/annotate/EntityConfig"
import AttributeConfig, { SelectData } from "components/annotate/AttributeConfig"

const API_URL = "https://p5vh54dmnjalmywytymzlzsqki0bcjkn.lambda-url.eu-west-2.on.aws/"

function Config({ workspace }: SectionProps) {
  const [config, setConfig] = useRecoilState(configState)
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)
  const [ontologySectionOpen, setOntologySectionOpen] = useState(true)
  const [availableOntologies, setAvailableOntologies] = useState<SelectData[]>([])
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(null)
  const [selectedOntologyConcepts, setSelectedOntologyConcepts] = useState<OntologyConcept[]>([])
  const [activeEntity, setActiveEntity] = useRecoilState(activeEntityState)

  const setPopulatedAttributes = useSetRecoilState(populatedAttributeState)
  const setActiveOntologyConcept = useSetRecoilState(activeOntologyConceptsState)

  const proposedAnnotation = useRecoilValue(proposedAnnotationState)
  const populatedAttributes = useRecoilValue(populatedAttributeState)
  const activeOntologyConcept = useRecoilValue(activeOntologyConceptsState)
  const documents = useRecoilValue(documentsState)
  const documentIndex = useRecoilValue(documentIndexState)

  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [activeTutorialStep, setActiveTutorialStep] = useRecoilState(activeTutorialStepState)
  const [selectedText, setSelectedText] = useState("")
  const [suggestedEntity, setSuggestedEntity] = useState("")
  const [suggestedAttributes, setSuggestedAttributes] = useState<Record<string, string>>({})

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(config => {
        const parsedConfig = parseJsonConfig(config.content)
        setConfig(parsedConfig)
      })
      .catch((e) => notify.error("Failed to load workspace config.", e))
  }, [setConfig, workspace.id])

  useEffect(() => {
    database
      .getWorkspaceOntologies(workspace.id)
      .then((ontologies) => {
        const data = ontologies.map(ontology => ({
          label: ontology.name,
          value: ontology.id,
        }))

        setAvailableOntologies(data)
      })
      .catch((e) => notify.error("Failed to load available ontologies.", e))
  }, [workspace.id])

  useEffect(() => {
    if (selectedOntologyId == null) {
      setSelectedOntologyConcepts([])
      setActiveOntologyConcept({ name: "", code: "" })
    } else {
      database
        .getOntologyConcepts(selectedOntologyId)
        .then(setSelectedOntologyConcepts)
        .catch((e) => notify.error("Failed to load ontology concepts.", e))
    }
  }, [selectedOntologyId, setActiveOntologyConcept])

  useEffect(() => {
    if (proposedAnnotation) {
      const { start, end } = proposedAnnotation
      const text = documents[documentIndex].content.slice(start, end)

      setSelectedText(text)
    }
  }, [proposedAnnotation, documents, documentIndex, config])

  useEffect(() => {
    if (selectedText !== "") {
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config,
          selectedText,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          try {
            const parsedData = JSON.parse(data)

            setSuggestedEntity(parsedData["entity"])
            setSuggestedAttributes(parsedData["attributes"])
          } catch (e) { }
        })
    }
  }, [config, selectedText])

  const clearPopulatedAttributes = () => {
    setPopulatedAttributes({})
  }

  const clearPopulatedOntologyConcepts = () => {
    setSelectedOntologyId(null)
    setSelectedOntologyConcepts([])
    setActiveOntologyConcept({ name: "", code: "" })
  }

  const addAnnotation = () => {
    if (!proposedAnnotation) {
      notify.error("You need to highlight text within the document.")
      return
    }

    if (!activeEntity) {
      notify.error("You need to select an entity.")
      return
    }

    const { start, end } = proposedAnnotation

    const documentId = documents[documentIndex].id
    const text = documents[documentIndex].content.slice(start, end)

    const allAttributes = {
      ...populatedAttributes,
    }

    if (activeOntologyConcept.name && activeOntologyConcept.code) {
      allAttributes["ontologyName"] = activeOntologyConcept.name
      allAttributes["ontologyCode"] = activeOntologyConcept.code
    }

    const rawAnnotation = {
      text,
      entity: activeEntity,
      start_index: start,
      end_index: end,
      attributes: allAttributes,
    } as RawAnnotation

    database
      .addWorkspaceAnnotation(workspace.id, documentId, rawAnnotation)
      .then((annotation) => {
        const copy = [...annotations]
        copy[documentIndex] = [...copy[documentIndex], annotation]
        setAnnotations(copy)
      })
      .catch((e) => notify.error("Failed to add annotation.", e))

    if (activeTutorialStep === 1) {
      setActiveTutorialStep(3)
    }
  }

  return (
    <Card shadow="xs" radius={5} p="xl">
      <ScrollArea scrollbarSize={0} sx={{ height: "76vh" }}>
        <Grid>
          <Grid.Col xs={12}>
            <Group position="apart">
              <Title
                text="Select text"
                description="Highlight the text you want to annotate."
                open={true}
                setOpen={() => { }}
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
            <Collapse in={entitySectionOpen}>
              <Container>
                <Text italic>
                  {selectedText === "" ? "Highlight the text you want to annotate." : selectedText}
                </Text>
              </Container>
            </Collapse>
          </Grid.Col>

          <Grid.Col xs={12} pb={0}>
            <Group position="apart">
              <Title
                text="Select entity"
                description="Select the entity you want to annotate."
                open={entitySectionOpen}
                setOpen={setEntitySectionOpen}
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
            <Collapse in={entitySectionOpen}>
              <Container>
                <Group position="left" spacing={4} mb={10}>
                  <Text size="sm">
                    Suggested:
                  </Text>

                  <Button
                    variant="subtle"
                    size="sm"
                    p={5}
                    onClick={() => {
                      if (suggestedEntity !== "") {
                        setActiveEntity(suggestedEntity)
                      }
                    }}
                  >
                    {suggestedEntity === "" ? "None" : suggestedEntity}
                  </Button>
                </Group>

                <EntityConfig config={config} />
              </Container>
            </Collapse>
          </Grid.Col>

          <Grid.Col xs={12} pb={0}>
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
              <Container>
                <Group position="left" spacing={4} mb={10}>
                  <Text size="sm">
                    Suggested:
                  </Text>

                  {Object.keys(suggestedAttributes).map((attribute) => (
                    <Button
                      key={attribute}
                      variant="subtle"
                      size="sm"
                      p={5}
                      onClick={() => {
                        const copy = { ...populatedAttributes }
                        copy[attribute] = suggestedAttributes[attribute]
                        setPopulatedAttributes(copy)
                      }}
                    >
                      {attribute} ({suggestedAttributes[attribute]})
                    </Button>
                  ))}
                </Group>

                <AttributeConfig config={config} />
              </Container>
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
                onClick={clearPopulatedOntologyConcepts}
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

                        setActiveOntologyConcept({
                          code: code ?? "",
                          name: name ?? "",
                        })
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Group>
            </Collapse>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Button fullWidth onClick={() => addAnnotation()}>
              Add annotation
            </Button>
          </Grid.Col>
        </Grid>
      </ScrollArea>
    </Card>
  )
}

export default Config
