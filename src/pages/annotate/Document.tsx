import { ActionIcon, Card, Divider, Group, Select } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons"
import { database, WorkspaceDocument } from "pages/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Interfaces"
import { TextAnnotateBlend } from "react-text-annotate-blend"
import { TokenAnnotator } from "react-text-annotate"
import { useRecoilState, useRecoilValue } from "recoil"
import { activeEntityState, entityColoursState } from "store/Annotate"

interface Annotation {
  start: number
  end: number
  text: string
  entity: string
  attributes: Attribute[]
}

interface Attribute {
  text: string
}

function Document({ workspace }: SectionProps) {
  const activeEntity = useRecoilValue(activeEntityState)
  const entityColours = useRecoilValue(entityColoursState)

  const [documentIndex, setDocumentIndex] = useState(0)
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])

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

  useEffect(() => {
    console.log(documentIndex)
  }, [documentIndex])

  useEffect(() => {
    console.log(annotations)
  }, [annotations])

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

          <TokenAnnotator
            tokens={documents[documentIndex].content.split(" ")}
            style={{ fontSize: "1.1rem" }}
            value={annotations.map(annotation => ({
              tag: annotation.entity,
              start: annotation.start,
              end: annotation.end,
              color: entityColours[annotation.entity],
            }))}
            onChange={(value) => {
              if (activeEntity === "") {
                alert("You need to select an entity")
                return
              }

              if (annotations.length >= value.length) {
                return
              }

              const annotation = value[value.length - 1]

              setAnnotations([
                ...annotations,
                {
                  start: annotation.start,
                  end: annotation.end,
                  entity: annotation.tag,
                  text: documents[documentIndex].content.slice(annotation.start, annotation.end),
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
          />
        </Card>
      }
    </>
  )
}

export default Document
