import { Button, Card, Collapse, Grid, Group, Text } from "@mantine/core"
import { IconX } from "@tabler/icons"
import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { database, WorkspaceAnnotation } from "storage/database"
import { annotationsState, documentIndexState, entityColoursState } from "storage/state/Annotate"
import { SectionProps } from "./Interfaces"

type Entity = string
type AnnotationGroup = Record<Entity, WorkspaceAnnotation[]>

function Output({ workspace }: SectionProps) {
  const entityColours = useRecoilValue(entityColoursState)
  const documentIndex = useRecoilValue(documentIndexState)

  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [groupedAnnotations, setGroupedAnnotations] = useState<AnnotationGroup>({})

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

  const deleteAnnotation = (annotationId: string) => {
    database
      .deleteWorkspaceAnnotation(annotationId)
      .then(() => {
        const copy = [...annotations]
        copy[documentIndex] = [...copy[documentIndex].filter(i => i.id !== annotationId)]
        setAnnotations(copy)
      })
  }

  return (
    <Card withBorder radius={5} p="xl" sx={{ height: "82.5%" }}>
      <Grid>
        <Grid.Col xs={12}>
          <Group position="apart" noWrap>
            <Text size="lg" weight={500}>
              Annotations
            </Text>

            <Button variant="subtle">
              Export
            </Button>
          </Group>
        </Grid.Col>

        {Object.keys(groupedAnnotations).map(entity => (
          <>
            <Grid.Col xs={12}>
              {entity}
            </Grid.Col>

            {groupedAnnotations[entity].map(annotation => (
              <Grid.Col xs={12}>
                <Card
                  radius={2}
                  p="sm"
                  sx={{
                    backgroundColor: entityColours[annotation.entity],
                    color: "#333333",
                  }}
                >
                  <Grid>
                    <Grid.Col xs={2}>
                      <IconX
                        size={16}
                        onClick={() => deleteAnnotation(annotation.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </Grid.Col>

                    <Grid.Col xs={10}>
                      <Text>
                        {annotation.text}
                      </Text>
                    </Grid.Col>
                  </Grid>

                  <Collapse in={false}>
                    {/* {Object.keys(annotation.attributes).map((attributeType) => (
                      <>{attributeType}</>
                    ))} */}
                  </Collapse>
                </Card>
              </Grid.Col>
            ))}
          </>
        ))}
      </Grid>
    </Card>
  )
}

export default Output
