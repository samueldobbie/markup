import { Group, Button, ActionIcon, Text, FileButton } from "@mantine/core"
import { IconTrash } from "@tabler/icons"
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
              <ActionIcon color="red">
                <IconTrash
                  size={16}
                  onClick={() => database.deleteWorkspaceDocument(document.id)}
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
