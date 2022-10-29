import { ActionIcon, Card, Divider, Group, Select } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons"
import { database, WorkspaceDocument } from "pages/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Interfaces"
import { TextAnnotateBlend } from "react-text-annotate-blend"
import { useRecoilState, useRecoilValue } from "recoil"
import { activeEntityState, annotationsState, entityColoursState } from "store/Annotate"

function Document({ workspace }: SectionProps) {
  const activeEntity = useRecoilValue(activeEntityState)
  const entityColours = useRecoilValue(entityColoursState)

  const [documentIndex, setDocumentIndex] = useState(0)
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [annotations, setAnnotations] = useRecoilState(annotationsState)

  const moveToFirstDocument = () => setDocumentIndex(0)
  const moveToPreviousDocument = () => setDocumentIndex(documentIndex - 1)
  const moveToNextDocument = () => setDocumentIndex(documentIndex + 1)
  const moveToLastDocument = () => setDocumentIndex(documents.length - 1)

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
      .catch(alert)
  }, [workspace.id])

  return (
    <>
      {documents.length > 0 &&
        <Card withBorder radius="md" p="xl" sx={{ height: "82.5%" }}>
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
            value={annotations.map(annotation => ({
              tag: "",
              start: annotation.start,
              end: annotation.end,
              color: entityColours[annotation.entity],
            }))}
            onChange={(value1) => {
              const value = value1 as {
                tag: string;
                start: number;
                end: number;
                color: string;
            }[]

              if (annotations.length >= value.length) {
                const updatedAnnotations = annotations.filter(i => {
                  let keep = false
                  
                  value.forEach((v) => {
                    if (v.start === i.start && v.end === i.end) {
                      keep = true
                    }
                  })

                  return keep
                })

                setAnnotations(updatedAnnotations)
                return
              }

              if (activeEntity === "") {
                alert("You need to select an entity")
                return
              }

              const annotation = value[value.length - 1]
              const { start, end, tag } = annotation

              setAnnotations([
                ...annotations,
                {
                  start,
                  end,
                  entity: tag,
                  text: documents[documentIndex].content.slice(start, end),
                  attributes: [],
                }
              ])
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
