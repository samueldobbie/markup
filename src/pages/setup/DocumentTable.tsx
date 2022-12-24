import { Group, Button, ActionIcon, Text, FileButton, Tooltip, Card } from "@mantine/core"
import { IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, WorkspaceDocument } from "storage/database/Database"
import { SectionProps } from "./Setup"

function DocumentTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [files, setFiles] = useState<File[]>([])
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
  }, [workspace.id])

  useEffect(() => {
    if (files.length === 0) return

    const func = async () => {
      database
        .addWorkspaceDocuments(workspace.id, files)
        .then(insertedDocuments => {
          setFiles([])
          setDocuments([...documents, ...insertedDocuments])
        })
    }

    func()
  }, [documents, files, workspace.id])

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
          { accessor: "name", title: <Text size={16}>Documents</Text> },
          {
            accessor: "actions",
            title: (
              <Group position="right">
                <FileButton onChange={setFiles} accept="plain/text" multiple>
                  {(props) => (
                    <Tooltip label="Each annotation filename (excl. file extension) must match the document you want to associate it with">
                      <Button
                        {...props}
                        variant="subtle"
                        disabled
                      >
                        Upload annotations
                      </Button>
                    </Tooltip>
                  )}
                </FileButton>

                <FileButton onChange={setFiles} accept="plain/text" multiple>
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
              <Group spacing={4} position="right" noWrap>
                <ActionIcon color="primary">
                  <IconTrash
                    size={16}
                    style={{ color: "rgb(217 138 138)" }}
                    onClick={(event) => {
                      event.stopPropagation()

                      database
                        .deleteWorkspaceDocument(document.id)
                        .then(() => setDocuments(documents.filter(i => i.id !== document.id)))
                        .catch(alert)
                    }}
                  />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default DocumentTable
