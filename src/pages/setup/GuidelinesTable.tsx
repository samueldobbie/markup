import { Group, Button, ActionIcon, Text, FileButton, Card } from "@mantine/core"
import { IconTrashX } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database } from "storage/database/Database"
import { SectionProps } from "./Setup"

export interface WorkspaceGuideline {
  id: string
  name: string
  content: string
}

function GuidelinesTable({ workspace }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [guidelines, setGuidelines] = useState<WorkspaceGuideline[]>([])

  useEffect(() => {
    database
      .getWorkspaceGuideline(workspace.id)
      .then((guidelines) => setGuidelines(guidelines))
  }, [workspace.id])

  useEffect(() => {
    if (file === null) return

    const func = async () => {
      database
        .addWorkspaceGuideline(workspace.id, file)
        .then(guidelines => {
          setFile(null)
          setGuidelines(guidelines)
        })
    }

    func()
  }, [file, workspace.id])

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withBorder={false}
        emptyState="Upload annotation guidelines"
        borderRadius={5}
        sx={{ minHeight: "225px" }}
        records={guidelines}
        rowExpansion={{
          content: (guideline) => (
            <Text
              p={20}
              mb={20}
              color="dimmed"
              sx={{
                whiteSpace: "pre-line",
                overflowX: "hidden",
              }}
            >
              {guideline.record.content}
            </Text>
          )
        }}
        columns={[
          {
            accessor: "name",
            title: (
              <Text size={16}>
                Annotation Guidelines

                <Text size={13} color="dimmed">
                  Optional
                </Text>
              </Text>
            ),
            render: (guideline) => <Text>{guideline.name}</Text>
          },
          {
            accessor: "actions",
            title: (
              <Group position="right" noWrap>
                <FileButton onChange={setFile} accept=".txt">
                  {(props) => (
                    <Button {...props}>
                      Upload guidelines
                    </Button>
                  )}
                </FileButton>
              </Group>
            ),
            textAlignment: "right",
            render: (guideline) => (
              <Group spacing={8} position="right" noWrap>
                <ActionIcon
                  color="primary"
                  onClick={() => {
                    database
                      .deleteWorkspaceGuideline(guideline.id)
                      .then(() => setGuidelines([]))
                      .catch(alert)
                  }}
                >
                  <IconTrashX
                    size={16}
                    style={{ color: "rgb(217 138 138)" }}
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

export default GuidelinesTable
