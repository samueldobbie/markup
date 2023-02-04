import { Group, Button, ActionIcon, Text, FileButton, Tooltip, Card } from "@mantine/core"
import { IconFilePlus, IconTrashX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import uuid from "react-uuid"
import { database, RawAnnotation, WorkspaceDocument } from "storage/database/Database"
import notify from "utils/Notifications"
import { SectionProps } from "./Setup"

function DocumentTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
      .catch(() => notify.error("Failed to load documents."))
  }, [workspace.id])

  useEffect(() => {
    if (documentFiles.length === 0) return

    const func = async () => {
      database
        .addWorkspaceDocuments(workspace.id, documentFiles)
        .then(insertedDocuments => {
          setDocumentFiles([])
          setDocuments([...documents, ...insertedDocuments])
        })
        .catch(() => notify.error("Failed to upload documents."))
    }

    func()
  }, [documents, documentFiles, workspace.id])

  const uploadAnnotations = async (documentId: string, file: File) => {
    const content = await file.text()
    const annotations = JSON.parse(content) as RawAnnotation[]

    database
      .addWorkspaceAnnotations(workspace.id, documentId, annotations)
      .catch(() => notify.error("Failed to upload annotations."))
  }

  useEffect(() => {
    if (setWorkspaceStatus === undefined) return

    if (documents.length === 0 && workspaceStatus.hasDocument) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasDocument: false,
      })
    } else if (documents.length > 0 && !workspaceStatus.hasDocument) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasDocument: true,
      })
    }
  }, [documents, workspaceStatus, setWorkspaceStatus])

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withBorder={false}
        emptyState="Upload documents to annotate"
        borderRadius={5}
        sx={{ minHeight: "500px" }}
        records={documents}
        rowExpansion={{
          content: (document) => (
            <Text p={20} color="dimmed" mb={20}>
              {document.record.content}
            </Text>
          )
        }}
        columns={[
          {
            accessor: "name",
            title: (
              <Text size={16}>
                Documents

                <Text size={13} color="dimmed">
                  Required
                </Text>
              </Text>
            ),
            render: (document) => (
              <>
                <Text>
                  {document.name}
                </Text>

                <Text size="sm" color="dimmed">
                  No annotations
                </Text>
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Group position="right">
                <FileButton onChange={setDocumentFiles} accept=".txt" multiple  key={uuid()}>
                  {(props) => (
                    <Button {...props}>
                      Upload documents
                    </Button>
                  )}
                </FileButton>
              </Group>
            ),
            textAlignment: "right",
            render: (document) => (
              <Group spacing={8} position="right" noWrap>
                <FileButton
                  accept=".json"
                  onChange={(file) => {
                    if (file) {
                      uploadAnnotations(document.id, file)
                    }
                  }}
                >
                  {(props) => (
                    <Tooltip label="Upload existing annotations">
                      <ActionIcon
                        color="primary"
                        {...props}
                      >
                        <IconFilePlus
                          size={16}
                          color="#0077be"
                        />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </FileButton>

                <Tooltip label="Delete document">
                  <ActionIcon
                    color="primary"
                    onClick={(event: any) => {
                      event.stopPropagation()

                      database
                        .deleteWorkspaceDocument(document.id)
                        .then(() => setDocuments(documents.filter(i => i.id !== document.id)))
                        .catch(() => notify.error("Failed to delete document."))
                    }}
                  >
                    <IconTrashX
                      size={16}
                      color="rgb(217 138 138)"
                    />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default DocumentTable

// const uploadAnnotations = async (documentId: string, file: File) => {
//   const rawAnnotationMap: Record<string, RawAnnotation> = {}
//   const content = await file.text()
//   const lines = content.split("\n")

//   for (const line of lines) {
//     if (line.startsWith("T")) {
//       const [id, annotation, text] = line.split("\t")
//       const [entity, start, end] = annotation.split(" ")

//       rawAnnotationMap[id] = {
//         entity,
//         start_index: parseInt(start),
//         end_index: parseInt(end),
//         attributes: {},
//         text,
//       }
//     } else if (line.startsWith("A")) {
//       const [_, attribute] = line.split("\t")
//       const [name, targetId, value] = attribute.split(" ")

//       if (rawAnnotationMap[targetId]) {
//         if (!rawAnnotationMap[targetId].attributes[name]) {
//           rawAnnotationMap[targetId].attributes[name] = []
//         }

//         rawAnnotationMap[targetId].attributes[name].push(value)
//       }
//     }
//   }

//   database
//     .addWorkspaceAnnotations(documentId, Object.values(rawAnnotationMap))
//     .catch(() => notify.error("Failed to upload annotations."))
// }
