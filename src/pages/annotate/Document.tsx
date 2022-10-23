import { ActionIcon, Card, Divider, Group, Select, Text, Textarea } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons"
import { database, WorkspaceDocument } from "pages/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Interfaces"

function Document({ workspace }: SectionProps) {
  const [documentIndex, setDocumentIndex] = useState(0)
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])

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
        <Card withBorder radius="md" p="xl">
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

          <Textarea autosize readOnly maxRows={25}>
            {documents[documentIndex].content}
          </Textarea>
        </Card>
      }
    </>
  )
}

export default Document
