import { useAnnotateStore } from "storage/state/Annotate"
import { Button, Card, Code, Grid, Group, ScrollArea, Select, Text } from "@mantine/core"
import { RawAnnotation, database } from "storage/database/Database"
import { useState, useEffect } from "react"
import { SectionProps } from "./Annotate"
import { parseJsonConfig } from "pages/annotate/ParseJsonConfig"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import notify from "utils/Notifications"
import Title from "components/title/Title"
import EntityConfig from "components/annotate/EntityConfig"
import AttributeConfig, { SelectData } from "components/annotate/AttributeConfig"
import { IconNumber1, IconNumber2, IconNumber3, IconNumber4 } from "@tabler/icons-react"
import { suggestAttributes, suggestEntity } from "utils/Suggest"

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

function Config({ workspace }: SectionProps) {
  const config = useAnnotateStore((s) => s.config)
  const setConfig = useAnnotateStore((s) => s.setConfig)
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)
  const [ontologySectionOpen, setOntologySectionOpen] = useState(true)
  const [availableOntologies, setAvailableOntologies] = useState<SelectData[]>([])
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(null)
  const [selectedOntologyConcepts, setSelectedOntologyConcepts] = useState<OntologyConcept[]>([])
  const activeEntity = useAnnotateStore((s) => s.activeEntity)
  const setActiveEntity = useAnnotateStore((s) => s.setActiveEntity)

  const setPopulatedAttributes = useAnnotateStore((s) => s.setPopulatedAttributes)
  const setActiveOntologyConcept = useAnnotateStore((s) => s.setActiveOntologyConcept)

  const proposedAnnotation = useAnnotateStore((s) => s.proposedAnnotation)
  const setProposedAnnotation = useAnnotateStore((s) => s.setProposedAnnotation)
  const populatedAttributes = useAnnotateStore((s) => s.populatedAttributes)
  const activeOntologyConcept = useAnnotateStore((s) => s.activeOntologyConcept)
  const documents = useAnnotateStore((s) => s.documents)
  const documentIndex = useAnnotateStore((s) => s.documentIndex)

  const annotations = useAnnotateStore((s) => s.annotations)
  const setAnnotations = useAnnotateStore((s) => s.setAnnotations)
  const activeTutorialStep = useAnnotateStore((s) => s.activeTutorialStep)
  const setActiveTutorialStep = useAnnotateStore((s) => s.setActiveTutorialStep)
  const [selectedText, setSelectedText] = useState("")
  const [suggestedEntity, setSuggestedEntity] = useState("")
  const [suggestedAttributes, setSuggestedAttributes] = useState<Record<string, string>>({})

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(config => {
        if (!config) {
          setConfig({
            entities: [],
            globalAttributes: [],
          })
          return
        }

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
    } else {
      setSelectedText("")
    }

    setActiveEntity("")
    setSuggestedEntity("")
    setSuggestedAttributes({})
  }, [proposedAnnotation, documents, documentIndex, config, setActiveEntity])

  useEffect(() => {
    if (selectedText === "") {
      setSuggestedEntity("")
      return
    }

    const controller = new AbortController()

    suggestEntity(
      workspace.id,
      selectedText,
      config.entities.map(entity => entity.name),
      controller.signal,
    )
      .then((data) => {
        setSuggestedEntity(data.entity || "")
      })
      .catch((error) => {
        if (!isAbortError(error)) {
          setSuggestedEntity("")
        }
      })

    return () => controller.abort()
  }, [config, selectedText, workspace.id])

  useEffect(() => {
    if (activeEntity === "" || selectedText === "") {
      setSuggestedAttributes({})
      return
    }

    const entityAttributes = config.entities.find(entity => entity.name === activeEntity)?.attributes ?? []
    const globalAttributes = config.globalAttributes
    const availableAttributes = [...entityAttributes, ...globalAttributes]
    const controller = new AbortController()

    suggestAttributes(
      workspace.id,
      selectedText,
      activeEntity,
      availableAttributes,
      controller.signal,
    )
      .then((data) => {
        const attributes = { ...data }

        Object.keys(attributes).forEach((key) => {
          if (attributes[key] === "") {
            delete attributes[key]
          }
        })

        setSuggestedAttributes(attributes)
      })
      .catch((error) => {
        if (!isAbortError(error)) {
          setSuggestedAttributes({})
        }
      })

    return () => controller.abort()
  }, [activeEntity, selectedText, config, workspace.id])

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

    setSelectedText("")
    setActiveEntity("")
    setSuggestedEntity("")
    setSuggestedAttributes({})
    setPopulatedAttributes({})
    setProposedAnnotation(null)
  }

  useEffect(() => {
    setActiveEntity("")
    setSuggestedEntity("")
    setSuggestedAttributes({})
    setPopulatedAttributes({})
  }, [documentIndex, selectedText, setActiveEntity, setPopulatedAttributes])

  return (
    <Card shadow="xs" radius={5} p="xl">
      <ScrollArea scrollbarSize={0} style={{ height: "76vh" }}>
        <Grid>
          <Grid.Col span={12}>
            <Group justify="space-between">
              <Title
                text="Select text"
                description="Highlight the document text you want to annotate."
                open={true}
                setOpen={() => { }}
                number={<IconNumber1 size={15} color="gray" />}
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={12}>
            <Text style={{ padding: 5 }}>
              <Code className="highlight-chip">
                {selectedText === "" ? "Highlight the text you want to annotate." : selectedText}
              </Code>
            </Text>
          </Grid.Col>

          <Grid.Col span={12} pb={0}>
            <Group justify="space-between">
              <Title
                text="Select entity"
                description="The high-level concept you are annotating."
                open={entitySectionOpen}
                setOpen={setEntitySectionOpen}
                number={<IconNumber2 size={15} color="gray" />}
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="flex-start" gap={4} mb={10}>
              <Text size="xs">
                Suggested:
              </Text>

              <Button
                variant="subtle"
                size="xs"
                p={0}
                onClick={() => {
                  if (suggestedEntity !== "") {
                    setActiveEntity(suggestedEntity)
                  }
                }}
              >
                {suggestedEntity === "" ? "NA" : suggestedEntity}
              </Button>
            </Group>

            <EntityConfig config={config} />
          </Grid.Col>

          <Grid.Col span={12} pb={0}>
            <Group justify="space-between">
              <Title
                text="Add attributes"
                description="The specific properties of the entity."
                open={attributeSectionOpen}
                setOpen={setAttributeSectionOpen}
                number={<IconNumber3 size={15} color="gray" />}
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="flex-start" gap={4} mb={10}>
              <Text size="xs">
                Suggested:
              </Text>

              {Object.keys(suggestedAttributes).length === 0 && (
                <Button
                  variant="subtle"
                  size="xs"
                  p={0}
                >
                  NA
                </Button>
              )}

              {Object.keys(suggestedAttributes).map((attribute) => (
                <Button
                  key={attribute}
                  variant="subtle"
                  size="xs"
                  p={0}
                  mr={5}
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
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="space-between">
              <Title
                text="Ontology"
                description="The concept you want to map to the entity."
                open={ontologySectionOpen}
                setOpen={setOntologySectionOpen}
                number={<IconNumber4 size={15} color="gray" />}
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={12}>
            <Group mb={20}>
              <Grid style={{ width: "100%" }}>
                <Grid.Col span={12}>
                  <Select
                    data={availableOntologies}
                    placeholder="Ontology"
                    size="sm"
                    searchable
                    onChange={setSelectedOntologyId}
                  />
                </Grid.Col>

                <Grid.Col span={12}>
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
          </Grid.Col>

          <Grid.Col span={12}>
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
