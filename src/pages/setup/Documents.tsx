import { Group, Button, ActionIcon, Text, FileInput, FileButton } from "@mantine/core"
import { IconTrash } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database, Document, RawDocument } from "utils/Database"
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
      const rawDocuments = [] as RawDocument[]

      for (const file of files) {
        rawDocuments.push({
          session_id: session.id,
          name: file.name,
          content: await file.text(),
        })
      }

      console.log(rawDocuments)

      database
        .addDocuments(rawDocuments)
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
                  onClick={() => {
                    console.log(document)
                    database.deleteDocument(document.id)
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
