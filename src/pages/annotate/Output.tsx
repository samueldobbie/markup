import { useAnnotateStore } from "storage/state/Annotate"
import { Box, Button, Card, Center, Collapse, Divider, Grid, Group, Menu, Modal, ScrollArea, SegmentedControl, Text } from "@mantine/core"
import { IconDownload, IconView360, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { database, WorkspaceAnnotation } from "storage/database"
import { SectionProps } from "./Annotate"
import { exportAnnotationFeedback } from "./ExportAnnotationFeedback"
import { exportJsonAnnotations } from "./ExportJsonAnnotations"
import notify from "utils/Notifications"
import SmartAssistant from "./SmartAssistant"

type Entity = string
type AnnotationGroup = Record<Entity, WorkspaceAnnotation[]>

function Output({ workspace }: SectionProps) {
  const entityColours = useAnnotateStore((s) => s.entityColours)
  const documents = useAnnotateStore((s) => s.documents)
  const documentIndex = useAnnotateStore((s) => s.documentIndex)

  const [guideline, setGuideline] = useState("")
  const [guidelineReady, setGuidelineReady] = useState(false)
  const annotations = useAnnotateStore((s) => s.annotations)
  const setAnnotations = useAnnotateStore((s) => s.setAnnotations)
  const [groupedAnnotations, setGroupedAnnotations] = useState<AnnotationGroup>({})
  const [openAnnotations, setOpenAnnotations] = useState<Record<string, boolean>>({})
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [segment, setSegment] = useState<"annotations" | "suggestions">("annotations")
  const [openedViewGuidelineModal, setOpenedViewGuidelineModal] = useState(false)

  const deleteAnnotation = (annotationId: string) => {
    database
      .deleteWorkspaceAnnotation(annotationId)
      .then(() => {
        const copy = [...annotations]
        copy[documentIndex] = [...copy[documentIndex].filter(i => i.id !== annotationId)]
        setAnnotations(copy)
      })
      .catch((e) => notify.error("Failed to delete annotation.", e))
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
    setGuidelineReady(false)

    database
      .getWorkspaceGuideline(workspace.id)
      .then((guidelines) => {
        setGuideline(guidelines.length > 0 ? guidelines[0].content : "")
      })
      .catch((e) => notify.error("Failed to load guidelines.", e))
      .finally(() => setGuidelineReady(true))
  }, [workspace.id])

  return (
    <>
      <Card shadow="xs" radius={5} p="xl">
        <ScrollArea scrollbarSize={0} style={{ height: "76vh" }}>
          <Grid>
            <Grid.Col span={12} mb={6}>
              <Group justify="space-between" wrap="nowrap">
                <Button
                  variant="subtle"
                  color="brand"
                  leftSection={<IconView360 size={16} />}
                  onClick={() => setOpenedViewGuidelineModal(true)}
                >
                  Guidelines
                </Button>

                <Menu width={200} shadow="xs">
                  <Menu.Target>
                    <Button
                      variant="subtle"
                      color="brand"
                      leftSection={<IconDownload size={16} />}
                    >
                      Export
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item onClick={() => exportJsonAnnotations(documents, annotations)}>
                      Annotations
                    </Menu.Item>
                    <Menu.Item onClick={() => exportAnnotationFeedback(workspace)}>
                      AI feedback
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Grid.Col>

            <Grid.Col span={12}>
              <Divider />
            </Grid.Col>

            <Grid.Col span={12}>
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
                          Suggested ({suggestionCount})
                        </Box>
                      </Center>
                    ),
                  },
                ]}
              />
            </Grid.Col>

            {segment === "annotations" && (
              <Grid.Col span={12}>
                {
                  Object.keys(groupedAnnotations).map((entity, index) => (
                    <div key={index}>
                      <Grid.Col span={12}>
                        <Text fz={16} fw={500}>
                          {entity}
                        </Text>
                      </Grid.Col>

                      {groupedAnnotations[entity].map((annotation, index) => (
                        <Grid.Col span={12} key={index}>
                          <Card
                            radius={2}
                            p="sm"
                            style={{
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
                              <Grid.Col span={2}>
                                <IconX
                                  size={16}
                                  onClick={() => deleteAnnotation(annotation.id)}
                                />
                              </Grid.Col>

                              <Grid.Col span={10} style={{ userSelect: "none" }}>
                                <Text>
                                  {annotation.text}
                                </Text>

                                <Text c="dimmed" fz={12} style={{ cursor: "pointer" }}>
                                  {Object.keys(annotation.attributes).length} attributes
                                </Text>
                              </Grid.Col>
                            </Grid>

                            <Collapse in={Object.keys(annotation.attributes).length > 0 && openAnnotations[annotation.id]} mt={10}>
                              {Object.keys(annotation.attributes).map((attributeType, index) => (
                                <Text fz={12} key={index}>
                                  {attributeType}

                                  <Text c="dimmed">
                                    {annotation.attributes[attributeType]}
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

            <Grid.Col span={12} display={segment === "suggestions" ? undefined : "none"}>
              <SmartAssistant
                workspace={workspace}
                guideline={guideline}
                guidelineReady={guidelineReady}
                setSuggestionCount={setSuggestionCount}
              />
            </Grid.Col>
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
      <ScrollArea scrollbarSize={0} style={{ height: 400 }}>
        <Text c="dimmed">
          {guideline || "No guidelines have been added to this workspace."}
        </Text>
      </ScrollArea>
    </Modal>
  )
}

export default Output
