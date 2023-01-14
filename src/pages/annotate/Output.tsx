import { Box, Button, Card, Center, Collapse, Divider, Grid, Group, Modal, ScrollArea, SegmentedControl, Text } from "@mantine/core"
import { IconDownload, IconView360, IconX } from "@tabler/icons"
import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { database, WorkspaceAnnotation } from "storage/database"
import { annotationsState, documentIndexState, documentsState, entityColoursState } from "storage/state/Annotate"
import { SectionProps } from "./Interfaces"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import SmartAssistant from "./SmartAssistant"
import { DEMO_DOMAINS } from "utils/Demo"

type Entity = string
type AnnotationGroup = Record<Entity, WorkspaceAnnotation[]>

interface AnnotationOutput {
  name: string
  payload: string[]
}

function Output({ workspace }: SectionProps) {
  const entityColours = useRecoilValue(entityColoursState)
  const documents = useRecoilValue(documentsState)
  const documentIndex = useRecoilValue(documentIndexState)

  const [guideline, setGuideline] = useState("")
  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [groupedAnnotations, setGroupedAnnotations] = useState<AnnotationGroup>({})
  const [openAnnotations, setOpenAnnotations] = useState<Record<string, boolean>>({})
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [segment, setSegment] = useState<"annotations" | "suggestions">("annotations")
  const [openedViewGuidelineModal, setOpenedViewGuidelineModal] = useState(false)
  const [isDemoSession, setIsDemoSession] = useState(false)

  useEffect(() => {
    setIsDemoSession(DEMO_DOMAINS.map(domain => domain.id).includes(workspace.id))
  }, [workspace.id])

  const exportAnnotations = async () => {
    const outputs = [] as AnnotationOutput[]

    documents.forEach((doc, index) => {
      const name = doc.name
      const output = buildSingleOutput(name, annotations[index])

      outputs.push(output)
    })

    saveAsZip(outputs)
  }

  function saveAsZip(outputs: AnnotationOutput[]): void {
    const zip = new JSZip()

    outputs.forEach((output: AnnotationOutput) => {
      if (output.name && output.payload) {
        zip.file(output.name, output.payload.join(""))
      }
    })

    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        saveAs(content, "annotations.zip")
      })
  }

  function buildSingleOutput(name: string, annotations: WorkspaceAnnotation[]): AnnotationOutput {
    return {
      name: name.split(".txt")[0] + ".ann",
      payload: buildExportRows(annotations),
    }
  }

  function buildExportRows(annotations: WorkspaceAnnotation[]): string[] {
    const rows = [] as string[]

    let annotationId = 1
    let attributeId = 1

    const addAnnotationRow = (annotation: WorkspaceAnnotation) => {
      const { entity, start_index, end_index, text } = annotation
      const normalizedText = normalizeText(text)
      const output = `T${annotationId}\t${entity} ${start_index} ${end_index}\t${normalizedText}\n`
      rows.push(output)
    }

    const addAttributeRow = (annotation: WorkspaceAnnotation) => {
      const { attributes } = annotation

      Object.entries(attributes).forEach(([name, value]) => {
        const output = `A${attributeId}\t${name} T${annotationId} ${value}\n`
        rows.push(output)
        attributeId++
      })
    }

    annotations.forEach((annotation: WorkspaceAnnotation) => {
      addAnnotationRow(annotation)
      addAttributeRow(annotation)
      annotationId++
    })

    return rows
  }

  function normalizeText(text: string): string {
    return text
      .split(/ |\n|\t/)
      .join("-")
  }

  const deleteAnnotation = (annotationId: string) => {
    database
      .deleteWorkspaceAnnotation(annotationId)
      .then(() => {
        const copy = [...annotations]
        copy[documentIndex] = [...copy[documentIndex].filter(i => i.id !== annotationId)]
        setAnnotations(copy)
      })
  }

  useEffect(() => {
    const grouped: AnnotationGroup = {}

    annotations[documentIndex]?.forEach((annotation) => {
      if (annotation.entity in grouped) {
        grouped[annotation.entity].push(annotation)
      } else {
        grouped[annotation.entity] = [annotation]
      }
    })

    setGroupedAnnotations(grouped)
  }, [annotations, documentIndex])

  useEffect(() => {
    annotations.forEach(documentAnnotations => {
      documentAnnotations.forEach(annotation => {
        if (!Object.keys(openAnnotations).includes(annotation.id)) {
          const copy = { ...openAnnotations }
          copy[annotation.id] = false
          setOpenAnnotations(copy)
        }
      })
    })
  }, [annotations, openAnnotations])

  useEffect(() => {
    database
      .getWorkspaceGuideline(workspace.id)
      .then((guidelines) => {
        if (guidelines.length > 0) {
          setGuideline(guidelines[0].content)
        }
      })
      .catch(alert)
  }, [workspace.id])

  return (
    <>
      <Card shadow="xs" radius={5} p="xl">
        <ScrollArea scrollbarSize={0} sx={{ height: "76vh" }}>
          <Grid>
            <Grid.Col xs={12} mb={6}>
              <Group position="apart" noWrap>
                <Button
                  variant="subtle"
                  leftIcon={<IconView360 size={16} />}
                  onClick={() => setOpenedViewGuidelineModal(true)}
                >
                  Guidelines
                </Button>

                <Button
                  variant="subtle"
                  leftIcon={<IconDownload size={16} />}
                  onClick={exportAnnotations}
                >
                  Export
                </Button>
              </Group>
            </Grid.Col>

            <Grid.Col xs={12}>
              <Divider />
            </Grid.Col>

            <Grid.Col xs={12}>
              <SegmentedControl
                fullWidth
                value={segment}
                mb={10}
                mt={10}
                onChange={(value) => setSegment(value as "annotations" | "suggestions")}
                data={[
                  {
                    value: "annotations",
                    label: (
                      <Center>
                        <Box ml={10}>
                          Annotations ({annotations[documentIndex]?.length || 0})
                        </Box>
                      </Center>
                    ),
                  },
                  {
                    value: "suggestions",
                    label: (
                      <Center>
                        <Box ml={10}>
                          Suggestions ({suggestionCount})
                        </Box>
                      </Center>
                    ),
                  },
                ]}
              />
            </Grid.Col>

            {segment === "annotations" && (
              <Grid.Col xs={12}>
                {
                  Object.keys(groupedAnnotations).map((entity, index) => (
                    <div key={index}>
                      <Grid.Col xs={12}>
                        <Text size={16} weight={500}>
                          {entity}
                        </Text>
                      </Grid.Col>

                      {groupedAnnotations[entity].map((annotation, index) => (
                        <Grid.Col xs={12} key={index}>
                          <Card
                            radius={2}
                            p="sm"
                            sx={{
                              backgroundColor: entityColours[annotation.entity],
                              color: "#333333",
                              cursor: "pointer"
                            }}
                            onClick={() => {
                              const copy = { ...openAnnotations }
                              copy[annotation.id] = !copy[annotation.id]
                              setOpenAnnotations(copy)
                            }}
                          >
                            <Grid>
                              <Grid.Col xs={2}>
                                <IconX
                                  size={16}
                                  onClick={() => deleteAnnotation(annotation.id)}
                                />
                              </Grid.Col>

                              <Grid.Col xs={10} sx={{ userSelect: "none" }}>
                                <Text>
                                  {annotation.text}
                                </Text>

                                <Text color="dimmed" size={12} sx={{ cursor: "pointer" }}>
                                  {Object.keys(annotation.attributes).length} attributes
                                </Text>
                              </Grid.Col>
                            </Grid>

                            <Collapse in={Object.keys(annotation.attributes).length > 0 && openAnnotations[annotation.id]} mt={10}>
                              {Object.keys(annotation.attributes).map((attributeType, index) => (
                                <Text size={12} key={index}>
                                  {attributeType}

                                  <Text color="dimmed">
                                    {annotation.attributes[attributeType].join(", ")}
                                  </Text>
                                </Text>
                              ))}
                            </Collapse>
                          </Card>
                        </Grid.Col>
                      ))}
                    </div>
                  ))
                }
              </Grid.Col>
            )}

            {segment === "suggestions" && (
              <Grid.Col xs={12}>
                {isDemoSession && (
                  <Text color="dimmed">
                    Predictive annotations are disabled in demo sessions.
                  </Text>
                )}

                {!isDemoSession && (
                  <SmartAssistant setSuggestionCount={setSuggestionCount} />
                )}
              </Grid.Col>
            )}
          </Grid>
        </ScrollArea>
      </Card>

      <ViewGuidelineModal
        guideline={guideline}
        openedModal={openedViewGuidelineModal}
        setOpenedModal={setOpenedViewGuidelineModal}
      />
    </>
  )
}

interface ViewGuidelineModalProps {
  guideline: string
  openedModal: boolean
  setOpenedModal: (openedModal: boolean) => void
}

function ViewGuidelineModal({ guideline, openedModal, setOpenedModal }: ViewGuidelineModalProps) {
  return (
    <Modal
      size="xl"
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Annotation Guidelines"
      centered
    >
      <ScrollArea scrollbarSize={0} sx={{ height: 400 }}>
        <Text color="dimmed">
          {guideline || "No guidelines have been set for this workspace."}
        </Text>
      </ScrollArea>
    </Modal>
  )
}

export default Output
