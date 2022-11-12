import { Button, Card, Collapse, Grid, Group, Text } from "@mantine/core"
import { IconX } from "@tabler/icons"
import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { database, WorkspaceAnnotation } from "storage/database"
import { annotationsState, documentIndexState, documentsState, entityColoursState } from "storage/state/Annotate"
import { SectionProps } from "./Interfaces"
import JSZip from "jszip"
import { saveAs } from "file-saver"

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

  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [groupedAnnotations, setGroupedAnnotations] = useState<AnnotationGroup>({})
  const [openAnnotations, setOpenAnnotations] = useState<Record<string, boolean>>({})

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

  // const handleSingleExport = () => {
  //   const name = documents[exportDocument].name

  //   let annotations2 = [] as IAnnotation[]

  //   for (const value of Object.values(annotations)) {
  //     annotations2 = [...annotations2, ...value]
  //   }

  //   const output = buildSingleOutput(name, annotations2)
  //   const blob = new Blob(output.payload, { type: "text/plain" })
  //   saveAs(blob, output.name)
  // }

  // const handleSessionExport = async () => {
  //   const outputs = [] as AnnotationOutput[]
  //   const documentSnapshot = await readDocuments()

  //   for (const document of documentSnapshot.docs) {
  //     const documentData = document.data()
  //     const annotations = [] as IAnnotation[]
  //     const annotationSnapshot = await document.ref.collection(Collection.Annotation).get()

  //     for (const annotation of annotationSnapshot.docs) {
  //       const annotationData = annotation.data()
  //       annotations.push(annotationData as IAnnotation)
  //     }

  //     const name = documentData.name
  //     const output = buildSingleOutput(name, annotations)

  //     outputs.push(output)
  //   }

  //   exportAnnotations(outputs)
  // }

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
                    {Object.keys(annotation.attributes).map((attributeType) => (
                      <Text size={12}>
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
          </>
        ))}
      </Grid>
    </Card>
  )
}

export default Output
