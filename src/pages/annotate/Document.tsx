import { ActionIcon, Card, Divider, Group, Select } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons"
import { database, WorkspaceDocument } from "pages/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Interfaces"
import { TextAnnotateBlend } from "react-text-annotate-blend"
import { useRecoilState, useRecoilValue } from "recoil"
import { activeEntityState, Annotation, annotationsState, documentIndexState, entityColoursState, populatedAttributeState } from "store/Annotate"
import "./Document.css"

interface RawAnnotation {
  tag: string
  start: number
  end: number
  color: string
}

function Document({ workspace }: SectionProps) {
  const activeEntity = useRecoilValue(activeEntityState)
  const entityColours = useRecoilValue(entityColoursState)
  const populatedAttributes = useRecoilValue(populatedAttributeState)

  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [documentIndex, setDocumentIndex] = useRecoilState(documentIndexState)
  const [annotations, setAnnotations] = useRecoilState(annotationsState)

  const moveToFirstDocument = () => setDocumentIndex(0)
  const moveToPreviousDocument = () => setDocumentIndex(documentIndex - 1)
  const moveToNextDocument = () => setDocumentIndex(documentIndex + 1)
  const moveToLastDocument = () => setDocumentIndex(documents.length - 1)

  const addAnnotation = (updatedAnnotations: RawAnnotation[]) => {
    const annotation = updatedAnnotations[updatedAnnotations.length - 1]

    const copy: Annotation[][] = []

    for (let i = 0; i < annotations.length; i++) {
      copy.push([...annotations[i]])
    }

    copy[documentIndex].push({
      start: annotation.start,
      end: annotation.end,
      entity: annotation.tag,
      text: documents[documentIndex].content.slice(
        annotation.start,
        annotation.end,
      ),
      attributes: populatedAttributes,
    })

    setAnnotations([...copy])
  }

  const deleteAnnotation = (updatedAnnotations: RawAnnotation[]) => {
    const filtered = annotations[documentIndex].filter(existing => {
      let keep = false

      updatedAnnotations.forEach((a) => {
        if (a.start === existing.start && a.end === existing.end) {
          keep = true
        }
      })

      return keep
    })

    const copy: Annotation[][] = []

    for (let i = 0; i < annotations.length; i++) {
      copy.push([...annotations[i]])
    }

    copy[documentIndex] = filtered

    setAnnotations([...copy])
    return
  }

  useEffect(() => {
    const newAnnotations: Annotation[][] = []
    let documentSize = documents.length

    while (documentSize > 0) {
      newAnnotations.push([])
      documentSize--
    }

    setAnnotations(newAnnotations)
  }, [documents.length, setAnnotations])

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
      .catch(alert)
  }, [workspace.id])

  return (
    <>
      {documents.length > 0 &&
        <Card withBorder radius={2} p="xl" sx={{ height: "82.5%" }}>
          <Group spacing={4} position="center" noWrap>
            <ActionIcon
              size="lg"
              color="x"
              variant="transparent"
              onClick={moveToFirstDocument}
              disabled={documentIndex <= 0}
            >
              <IconChevronsLeft size={16} />
            </ActionIcon>

            <ActionIcon
              size="lg"
              color="x"
              variant="transparent"
              onClick={moveToPreviousDocument}
              disabled={documentIndex <= 0}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>

            <Select
              data={documents.map(i => i.name)}
              value={documents[documentIndex].name}
              onChange={(nextDocumentName) => {
                documents.forEach((document, index) => {
                  if (document.name === nextDocumentName) {
                    setDocumentIndex(index)
                    return
                  }
                })
              }}
            />

            <ActionIcon
              size="lg"
              color="x"
              variant="transparent"
              onClick={moveToNextDocument}
              disabled={documentIndex >= documents.length - 1}
            >
              <IconChevronRight size={16} />
            </ActionIcon>

            <ActionIcon
              size="lg"
              color="x"
              variant="transparent"
              onClick={moveToLastDocument}
              disabled={documentIndex >= documents.length - 1}
            >
              <IconChevronsRight size={16} />
            </ActionIcon>
          </Group>

          <Divider m={20} />

          <TextAnnotateBlend
            content={documents[documentIndex].content}
            value={annotations[documentIndex]?.map(annotation => {
              const rawAnnotation: RawAnnotation = {
                tag: "",
                start: annotation.start,
                end: annotation.end,
                color: entityColours[annotation.entity],
              }

              return rawAnnotation
            })}
            onChange={(updatedAnnotations) => {
              const shouldDelete = annotations[documentIndex].length >= updatedAnnotations.length

              if (shouldDelete) {
                deleteAnnotation(updatedAnnotations)
                return
              }

              if (activeEntity === "") {
                alert("You need to select an entity")
                return
              }

              addAnnotation(updatedAnnotations)
            }}
            getSpan={(span) => ({
              tag: activeEntity,
              color: entityColours[activeEntity],
              start: span.start,
              end: span.end,
            })}
            style={{ fontSize: "1.1rem" }}
          />
        </Card>
      }
    </>
  )
}

export default Document
