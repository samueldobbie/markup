import { Group, Button, ActionIcon, Text, FileButton, Tooltip, Card } from "@mantine/core"
import { IconFilePlus, IconTrashX } from "@tabler/icons-react"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, WorkspaceDocumentWithAnnotationCount } from "storage/database/Database"
import notify from "utils/Notifications"
import { parseJsonAnnotations } from "./ParseJsonAnnotations"
import { parseStandoffAnnotations } from "./ParseStandoffAnnotations"
import { SectionProps } from "./Setup"

const PAGE_SIZE = 10

function DocumentTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [documents, setDocuments] = useState<WorkspaceDocumentWithAnnotationCount[]>([])
  const [documentCount, setDocumentCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  const refresh = () => setRefreshToken((token) => token + 1)

  const uploadAnnotations = async (documentId: string, file: File) => {
    const format = file.name.split(".").pop()
    const content = await file.text()

    const rawAnnotations = format === "json"
      ? parseJsonAnnotations(content)
      : parseStandoffAnnotations(content)

    await database.addWorkspaceAnnotations(workspace.id, documentId, rawAnnotations)
    notify.success(`${rawAnnotations.length} annotations uploaded.`)
  }

  const uploadAnnotationsForDocument = (documentId: string, file: File) => {
    uploadAnnotations(documentId, file)
      .catch((e) => notify.error("Failed to upload annotations.", e))
      .finally(refresh)
  }

  const uploadAnnotationFiles = (files: File[]) => {
    Promise.all(files.map(async (file) => {
      const document = await database.findWorkspaceDocumentForFile(workspace.id, file.name)

      if (document) {
        await uploadAnnotations(document.id, file)
      }
    }))
      .catch((e) => notify.error("Failed to upload annotations.", e))
      .finally(refresh)
  }

  const uploadDocumentFiles = (files: File[]) => {
    if (files.length === 0) return

    database
      .addWorkspaceDocuments(workspace.id, files)
      .then((insertedDocuments) => notify.success(`${insertedDocuments.length} documents uploaded.`))
      .catch((e) => notify.error("Failed to upload documents.", e))
      .finally(refresh)
  }

  useEffect(() => {
    setPage(1)
  }, [workspace.id])

  useEffect(() => {
    let cancelled = false
    const from = (page - 1) * PAGE_SIZE

    setLoading(true)

    Promise.all([
      database.getWorkspaceDocumentCount(workspace.id),
      database.getWorkspaceDocumentPageWithAnnotationCounts(workspace.id, from, from + PAGE_SIZE - 1),
    ])
      .then(([count, pageDocuments]) => {
        if (cancelled) return

        const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

        setDocumentCount(count)

        if (page > pageCount) {
          setPage(pageCount)
        } else {
          setDocuments(pageDocuments)
        }
      })
      .catch((e) => notify.error("Failed to load documents.", e))
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [page, refreshToken, workspace.id])

  useEffect(() => {
    if (setWorkspaceStatus === undefined || loading) return

    if (documentCount === 0 && workspaceStatus.hasDocument) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasDocument: false,
      })
    } else if (documentCount > 0 && !workspaceStatus.hasDocument) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasDocument: true,
      })
    }
  }, [documentCount, loading, workspaceStatus, setWorkspaceStatus])

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withTableBorder={false}
        emptyState="Upload documents to annotate"
        borderRadius={5}
        style={{ minHeight: "500px" }}
        records={documents}
        totalRecords={documentCount}
        fetching={loading}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        paginationText={({ from, to, totalRecords }) => `${from}–${to} of ${totalRecords}`}
        rowExpansion={{
          content: (document) => (
            <Text p={20} c="dimmed" mb={20}>
              {document.record.content}
            </Text>
          )
        }}
        columns={[
          {
            accessor: "name",
            title: (
              <Text fz={16} component="div">
                Documents

                <Text fz={13} c="dimmed">
                  Required
                </Text>
              </Text>
            ),
            render: (document) => (
              <>
                <Text>
                  {document.name}
                </Text>

                {document.annotation_count > 0 && (
                  <Text size="sm" c="dimmed">
                    {document.annotation_count} annotations
                  </Text>
                )}

                {document.annotation_count === 0 && (
                  <Text size="sm" c="dimmed">
                    No annotations
                  </Text>
                )}
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Group justify="flex-end">
                <FileButton onChange={uploadAnnotationFiles} accept=".json,.ann" multiple key={crypto.randomUUID()}>
                  {(props) => (
                    <Button {...props} variant="light">
                      Upload annotations
                    </Button>
                  )}
                </FileButton>

                <FileButton onChange={uploadDocumentFiles} accept=".txt" multiple key={crypto.randomUUID()}>
                  {(props) => (
                    <Button {...props}>
                      Upload documents
                    </Button>
                  )}
                </FileButton>
              </Group>
            ),
            textAlign: "right",
            render: (document) => (
              <Group gap={8} justify="flex-end" wrap="nowrap">
                <FileButton
                  accept=".json,.ann"
                  onChange={(file) => {
                    if (file) {
                      uploadAnnotationsForDocument(document.id, file)
                    }
                  }}
                >
                  {(props) => (
                    <Tooltip label="Upload existing annotations">
                      <ActionIcon
                        {...props}
                        color="brand"
                        variant="subtle"
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
                    color="brand"
                    variant="subtle"
                    onClick={(event: any) => {
                      event.stopPropagation()

                      database
                        .deleteWorkspaceDocument(document.id)
                        .then(refresh)
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
