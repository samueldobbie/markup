import { Group, Button, ActionIcon, Text, FileButton, Tooltip, Card } from "@mantine/core"
import { IconFilePlus, IconTrashX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useCallback, useEffect, useState } from "react"
import uuid from "react-uuid"
import { database, WorkspaceDocument } from "storage/database/Database"
import notify from "utils/Notifications"
import { parseJsonAnnotations } from "./ParseJsonAnnotations"
import { parseStandoffAnnotations } from "./ParseStandoffAnnotations"
import { SectionProps } from "./Setup"

function DocumentTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [annotationFiles, setAnnotationFiles] = useState<File[]>([])
  const [documentToAnnotationCount, setDocumentToAnnotationCount] = useState<Record<string, number>>({})

  const uploadAnnotations = useCallback(async (documentId: string, file: File) => {
    const format = file.name.split(".").pop()
    const content = await file.text()

    const rawAnnotations = format === "json"
      ? parseJsonAnnotations(content)
      : parseStandoffAnnotations(content)

    database
      .addWorkspaceAnnotations(workspace.id, documentId, rawAnnotations)
      .then(() => notify.success(`${rawAnnotations} annotations uploaded.`))
      .catch((e) => notify.error("Failed to upload annotations.", e))
  }, [workspace.id])

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
      .catch((e) => notify.error("Failed to load documents.", e))
  }, [workspace.id])

  useEffect(() => {
    if (documentFiles.length === 0) return

    const func = async () => {
      database
        .addWorkspaceDocuments(workspace.id, documentFiles)
        .then(insertedDocuments => {
          setDocumentFiles([])
          setDocuments([...documents, ...insertedDocuments])
          notify.success(`${insertedDocuments.length} documents uploaded.`)
        })
        .catch((e) => notify.error("Failed to upload documents.", e))
    }

    func()
  }, [documents, documentFiles, workspace.id])

  useEffect(() => {
    annotationFiles.forEach(annotationFile => {
      const document = documents.find(document => {
        const documentFileName = document.name.split(".").slice(0, -1).join(".")
        const annotationFileName = annotationFile.name.split(".").slice(0, -1).join(".")

        return documentFileName === annotationFileName
      })

      if (document) {
        uploadAnnotations(document.id, annotationFile)
      }
    })
  }, [annotationFiles, documents, uploadAnnotations, workspace.id])

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

  useEffect(() => {
    const documentIds = documents.map(document => document.id)

    database
      .getWorkspaceAnnotations(documentIds)
      .then(documentAnnotations => {
        const documentToAnnotationCount = {} as Record<string, number>

        documentAnnotations.forEach(documentAnnotation => {
          if (documentAnnotation.length > 0) {
            const documentId = documentAnnotation[0].document_id

            documentToAnnotationCount[documentId] = documentAnnotation.length
          }
        })

        setDocumentToAnnotationCount(documentToAnnotationCount)
      })
      .catch((e) => notify.error("Failed to load annotations.", e))
  }, [documents])

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

                {documentToAnnotationCount[document.id] && (
                  <Text size="sm" color="dimmed">
                    {documentToAnnotationCount[document.id]} annotations
                  </Text>
                )}

                {!documentToAnnotationCount[document.id] && (
                  <Text size="sm" color="dimmed">
                    No annotations
                  </Text>
                )}
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Group position="right">
                <FileButton onChange={setAnnotationFiles} accept=".json,.ann" multiple key={uuid()}>
                  {(props) => (
                    <Button {...props} variant="light">
                      Upload annotations
                    </Button>
                  )}
                </FileButton>

                <FileButton onChange={setDocumentFiles} accept=".txt" multiple key={uuid()}>
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
                  accept=".json,.ann"
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
                        .catch((e) => notify.error("Failed to delete document.", e))
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
