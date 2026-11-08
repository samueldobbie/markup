import { ActionIcon, Button, Card, Group, Select, Text, Tooltip } from "@mantine/core"
import { IconTrashX } from "@tabler/icons-react"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { database, Ontology, WorkspaceOntology } from "storage/database/Database"
import notify from "utils/Notifications"
import { Path } from "utils/Path"
import { SectionProps } from "./Setup"

function OntologyLinksTable({ workspace }: SectionProps) {
  const [links, setLinks] = useState<WorkspaceOntology[]>([])
  const [userOntologies, setUserOntologies] = useState<Ontology[]>([])
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(null)

  const refresh = () => {
    database
      .getWorkspaceOntologyLinks(workspace.id)
      .then(setLinks)
      .catch((e) => notify.error("Failed to load workspace ontologies.", e))
  }

  useEffect(refresh, [workspace.id])

  useEffect(() => {
    database
      .getUserOntologies()
      .then(setUserOntologies)
      .catch((e) => notify.error("Failed to load your ontologies.", e))
  }, [])

  const linkedIds = new Set(links.map((link) => link.ontology.id))
  const options = userOntologies
    .filter((ontology) => !linkedIds.has(ontology.id))
    .map((ontology) => ({ label: ontology.name, value: ontology.id }))

  const linkOntology = () => {
    if (!selectedOntologyId) return

    database
      .addWorkspaceOntology(workspace.id, selectedOntologyId)
      .then(() => {
        setSelectedOntologyId(null)
        refresh()
      })
      .catch((e) => notify.error("Failed to link ontology.", e))
  }

  const unlinkOntology = (link: WorkspaceOntology) => {
    database
      .removeWorkspaceOntology(link.id)
      .then(() => setLinks(links.filter((item) => item.id !== link.id)))
      .catch((e) => notify.error("Failed to unlink ontology.", e))
  }

  return (
    <Card shadow="xs" radius={5}>
      <DataTable
        withTableBorder={false}
        emptyState={
          userOntologies.length === 0
            ? <Text size="sm" c="dimmed">Add an ontology from the <Link to={Path.Dashboard}>dashboard</Link> first</Text>
            : "Link an ontology for concept mapping"
        }
        borderRadius={5}
        style={{ minHeight: "225px" }}
        records={links}
        columns={[
          {
            accessor: "name",
            title: (
              <Text fz={16} component="div">
                Ontologies

                <Text fz={13} c="dimmed">
                  Optional
                </Text>
              </Text>
            ),
            render: (link) => (
              <>
                <Text>{link.ontology.name}</Text>

                {link.ontology.description && (
                  <Text size="sm" c="dimmed">{link.ontology.description}</Text>
                )}
              </>
            ),
          },
          {
            accessor: "actions",
            title: (
              <Group gap={8} justify="flex-end" wrap="nowrap">
                <Select
                  data={options}
                  value={selectedOntologyId}
                  onChange={setSelectedOntologyId}
                  placeholder="Ontology"
                  searchable
                  size="sm"
                  disabled={options.length === 0}
                />

                <Button onClick={linkOntology} disabled={!selectedOntologyId}>
                  Link
                </Button>
              </Group>
            ),
            textAlign: "right",
            render: (link) => (
              <Group gap={8} justify="flex-end" wrap="nowrap">
                <Tooltip label="Unlink ontology">
                  <ActionIcon color="brand" variant="subtle" onClick={() => unlinkOntology(link)}>
                    <IconTrashX size={16} style={{ color: "rgb(217 138 138)" }} />
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

export default OntologyLinksTable
