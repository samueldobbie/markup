import { Button, Card, Grid, Group, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { Annotation, annotationsState, entityColoursState } from "store/Annotate"
import { SectionProps } from "./Interfaces"

type AnnotationGroup = Record<string, Annotation[]>

function Output({ workspace }: SectionProps) {
  const entityColours = useRecoilValue(entityColoursState)
  const annotations = useRecoilValue(annotationsState)

  const [groupedAnnotations, setGroupedAnnotations] = useState<AnnotationGroup>({})

  useEffect(() => {
    const grouped: AnnotationGroup = {}

    annotations.forEach((annotation) => {
      if (annotation.entity in grouped) {
        grouped[annotation.entity].push(annotation)
      } else {
        grouped[annotation.entity] = [annotation]
      }
    })

    setGroupedAnnotations(grouped)
  }, [annotations])

  // useEffect(() => {
  //   groupAnnotations()
  // }, [annotations, documentIndex])

  // function groupAnnotations() {
  //   const grouped: AnnotationGroup = {}

  //   annotations.forEach((annotation) => {
  //     if (annotation.entity in grouped) {
  //       grouped[annotation.entity].push(annotation)
  //     } else {
  //       grouped[annotation.entity] = [annotation]
  //     }
  //   })

  //   // if (documents[documentIndex] && annotations[documents[documentIndex].id]) {
  //   //   const anns = annotations[documents[documentIndex].id]

  //   //   for (let i = 0; i < anns.length; i++) {
  //   //     const annotation = anns[i]
  //   //     const entity = annotation.entity

  //   //     if (entity in grouped) {
  //   //       for (let j = 0; j < anns.length; j++) {
  //   //         if (j == anns.length - 1) {
  //   //           grouped[entity].push(anns[i])
  //   //           break
  //   //         }

  //   //         if (annotation.startIndex < anns[j].startIndex) {
  //   //           grouped[entity].splice(j, 0, annotation)
  //   //           break
  //   //         }
  //   //       }
  //   //     } else {
  //   //       grouped[entity] = [annotation]
  //   //     }
  //   // }
  //   setGroupedAnnotations(grouped)
  // }

  return (
    <Card withBorder radius="md" p="xl" sx={{ height: "82.5%" }}>
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
                <Card sx={{
                  backgroundColor: entityColours[annotation.entity],
                  color: "#333333",
                }}>
                  {annotation.text}
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
