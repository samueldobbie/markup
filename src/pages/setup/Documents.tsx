import { Group, Button, ActionIcon, Text, FileButton } from "@mantine/core"
import { IconChevronDown, IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, WorkspaceDocument } from "pages/database/Database"
import { SectionProps } from "./Interfaces"

function Documents({ workspace }: SectionProps) {
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

  return (
    <DataTable
      withBorder
      highlightOnHover
      emptyState="Upload documents to annotate"
      borderRadius="md"
      sx={{ minHeight: "500px" }}
      records={documents}
      rowExpansion={{
        content: (document) => (
          <Text p={20} color="dimmed">
            {document.record.content.slice(0, 250)}...
          </Text>
        )
      }}
      columns={[
        { accessor: "name", title: <Text size={16}>Documents</Text> },
        {
          accessor: "actions",
          title: (
            <FileButton onChange={setFiles} accept="plain/text" multiple>
              {(props) => (
                <Button
                  {...props}
                  variant="light"
                >
                  Upload documents
                </Button>
              )}
            </FileButton>
          ),
          textAlignment: "right",
          render: (document) => (
            <Group spacing={4} position="right" noWrap>
              <ActionIcon color="red" variant="light">
                <IconTrash
                  size={16}
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
  )
}

export default Documents
