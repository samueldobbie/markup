import { Group, Button, ActionIcon, Text, FileButton } from "@mantine/core"
import { IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Document } from "utils/Database"
import { SectionProps } from "./Interfaces"

function Documents({ session }: SectionProps) {
  const [files, setFiles] = useState<File[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    database
      .getDocuments(session.id)
      .then(setDocuments)
  }, [session.id])

  useEffect(() => {
    if (files.length === 0) return

    const func = async () => {
      database
        .addDocuments(session.id, files)
        .then(insertedDocuments => {
          setFiles([])
          setDocuments([...documents, ...insertedDocuments])
        })
    }

    func()
  }, [documents, files, session.id])

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
                  onClick={() => database.deleteDocument(document.id)}
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
