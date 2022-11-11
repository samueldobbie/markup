import { Button, Card, Collapse, Grid, Group, Text } from "@mantine/core"
import { IconX } from "@tabler/icons"
import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { WorkspaceAnnotation } from "storage/database"
import { annotationsState, documentIndexState, entityColoursState } from "storage/state/Annotate"
import { SectionProps } from "./Interfaces"

type AnnotationGroup = Record<string, WorkspaceAnnotation[]>

interface AnnotationOutput {
  name: string
  payload: string[]
}

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

  const exportAnnotations = () => {
    // const outputs = [] as AnnotationOutput[]
    // const documentSnapshot = await readDocuments()

    // for (const document of documentSnapshot.docs) {
    //   const documentData = document.data()
    //   const annotations = [] as IAnnotation[]
    //   const annotationSnapshot = await document.ref.collection(Collection.Annotation).get()

    //   for (const annotation of annotationSnapshot.docs) {
    //     const annotationData = annotation.data()
    //     annotations.push(annotationData as IAnnotation)
    //   }

    //   const name = documentData.name
    //   const output = buildSingleOutput(name, annotations)

    //   outputs.push(output)
    // }

    // exportAnnotations(outputs)
  }

  const readDocuments = () => {
    // database.getWorkspaceAnnotations(workspace.id)
  }

  const deleteAnnotation = () => {
    const filteredAnnotations = annotations[documentIndex].filter(existing => {
      let keep = false

      annotations.forEach((updated) => {
        // if (updated.localId === anno)

        // const shouldKeep = 
        //   updated.start === existing.start &&
        //   updated.end === existing.end
        // )

        // if (shouldKeep) keep = true
      })

      return keep
    })

    const copy: WorkspaceAnnotation[][] = []

    for (let i = 0; i < annotations.length; i++) {
      copy.push([...annotations[i]])
    }

    copy[documentIndex] = filteredAnnotations

    setAnnotations([...copy])
  }

  return (
    <Card withBorder radius={5} p="xl" sx={{ height: "82.5%" }}>
      <Grid>
        <Grid.Col xs={12}>
          <Group position="apart" noWrap>
            <Text size="lg" weight={500}>
              Annotations
            </Text>

            <Button variant="subtle" onClick={exportAnnotations}>
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
                        onClick={() => { }}
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

// const deleteAnnotation = (updatedAnnotations: WorkspaceAnnotation[]) => {
//   const filtered = annotations[documentIndex].filter(existing => {
//     let keep = false

//     updatedAnnotations.forEach((a) => {
//       if (a.id === existing.id) {
//         keep = true
//       }
//     })

//     return keep
//   })

//   const copy: WorkspaceAnnotation[][] = []

//   for (let i = 0; i < annotations.length; i++) {
//     copy.push([...annotations[i]])
//   }

//   copy[documentIndex] = filtered

//   setAnnotations([...copy])
//   return
// }
