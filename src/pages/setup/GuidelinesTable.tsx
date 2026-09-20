import { Group, Button, ActionIcon, Text, FileButton, Card, Tooltip } from "@mantine/core"
import { IconTrashX } from "@tabler/icons-react"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { database } from "storage/database/Database"
import notify from "utils/Notifications"
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
      .catch((e) => notify.error("Failed to load guidelines.", e))
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
        .catch((e) => notify.error("Failed to upload guidelines.", e))
    }

    func()
  }, [file, workspace.id])

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withTableBorder={false}
        emptyState="Upload annotation guidelines"
        borderRadius={5}
        style={{ minHeight: "225px" }}
        records={guidelines}
        rowExpansion={{
          content: (guideline) => (
            <Text
              p={20}
              mb={20}
              c="dimmed"
              style={{
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
              <Text fz={16} component="div">
                Annotation Guidelines

                <Text fz={13} c="dimmed">
                  Optional
                </Text>
              </Text>
            ),
            render: (guideline) => <Text>{guideline.name}</Text>
          },
          {
            accessor: "actions",
            title: (
              <Group justify="flex-end" wrap="nowrap">
                <FileButton onChange={setFile} accept=".txt" key={crypto.randomUUID()}>
                  {(props) => (
                    <Button {...props}>
                      Upload guidelines
                    </Button>
                  )}
                </FileButton>
              </Group>
            ),
            textAlign: "right",
            render: (guideline) => (
              <Group gap={8} justify="flex-end" wrap="nowrap">
                <Tooltip label="Delete guidelines">
                  <ActionIcon
                    color="brand"
                    variant="subtle"
                    onClick={() => {
                      database
                        .deleteWorkspaceGuideline(guideline.id)
                        .then(() => setGuidelines([]))
                        .catch((e) => notify.error("Failed to delete guideline.", e))
                    }}
                  >
                    <IconTrashX
                      size={16}
                      style={{ color: "rgb(217 138 138)" }}
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

export default GuidelinesTable
