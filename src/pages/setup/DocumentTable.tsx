import { Group, Button, ActionIcon, Text, FileButton, Tooltip, Card } from "@mantine/core"
import { IconFilePlus, IconTrashX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, WorkspaceDocument } from "storage/database/Database"
import { SectionProps } from "./Setup"

function DocumentTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [annotationFile, setAnnotationFile] = useState<File | null>(null)

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
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
    }

    func()
  }, [documents, documentFiles, workspace.id])

  // useEffect(() => {
  //   if (annotationFiles.length === 0) return

  //   const func = async () => {
  //     // database
  //     //   .addWorkspaceAnnotations(workspace.id, annotationFiles)
  //     //   .then(insertedAnnotations => {
  //     //     setAnnotationFiles([])
  //     //     setAnnotations([...annotations, ...insertedAnnotations])
  //     //   })
  //   }

  //   func()
  // }, [annotations, annotationFiles, workspace.id])

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
            title: <Text size={16}>Documents</Text>,
            render: (document) => (
              <>
              <Text>
                {document.name}
              </Text>

              <Text size="sm" color="dimmed">
                {document.content.split(" ").length} words
              </Text>
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Group position="right">
                <FileButton onChange={setDocumentFiles} accept=".txt" multiple>
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
                <FileButton onChange={setAnnotationFile} accept=".ann">
                  {(props) => (
                    <Tooltip label="Add annotations">
                      <ActionIcon
                        color="primary"
                        {...props}
                      >
                        <IconFilePlus size={16} />
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
                        .catch(alert)
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
