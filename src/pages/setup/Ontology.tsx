import { Group, Button, ActionIcon, Text } from "@mantine/core"
import { IconTrash, IconEdit } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { database } from "utils/Database"
import { SectionProps } from "./Interfaces"

function Ontology({ session }: SectionProps) {
  return (
    <DataTable
      withBorder
      highlightOnHover
      emptyState="Import an ontology or explore existing ones"
      borderRadius="md"
      sx={{ minHeight: "500px" }}
      records={[]}
      columns={[
        { accessor: "name", title: <Text size={16}>Ontology</Text> },
        {
          accessor: "actions",
          title: (
            <Group spacing={4} position="right" noWrap>
              <Button variant="subtle">
                Explore
              </Button>

              <Button variant="light">
                Upload ontology
              </Button>
            </Group>
          ),
          textAlignment: "right",
          render: (ontology) => (
            <Group spacing={4} position="right" noWrap>
              <ActionIcon color="red">
                <IconTrash
                  size={16}
                  onClick={() => database.deleteOntology()}
                />
              </ActionIcon>

              <ActionIcon color="blue">
                <IconEdit size={16} />
              </ActionIcon>
            </Group>
          ),
        },
      ]}
    />
  )
}

export default Ontology
