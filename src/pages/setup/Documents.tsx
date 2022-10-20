import { Group, Button, ActionIcon, Text, FileInput } from "@mantine/core"
import { IconTrash, IconUpload } from "@tabler/icons"
import { DataTable } from "mantine-datatable"
import { database } from "utils/Database"
import { SectionProps } from "./Interfaces"
import UploadButton from "./UploadButton"

function Documents({ session }: SectionProps) {
  const uploadDocuments = async () => {

  }

  return (
    <DataTable
      withBorder
      highlightOnHover
      emptyState="Import an ontology or explore existing ones"
      borderRadius="md"
      sx={{ minHeight: "500px" }}
      records={[]}
      columns={[
        { accessor: "name", title: <Text size={16}>Documents</Text> },
        {
          accessor: "actions",
          title: (
            <>
              {/* <FileInput placeholder="Your resume" multiple icon={<IconUpload size={14} />} /> */}

              <Button variant="light" onClick={uploadDocuments}>
                Upload documents
              </Button>
            </>
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
            </Group>
          ),
        },
      ]}
    />
  )
}

export default Documents
