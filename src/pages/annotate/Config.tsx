import { Button, Card, Collapse, Grid, Group, ScrollArea, Select } from "@mantine/core"
import { database } from "storage/database/Database"
import { useState, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { activeOntologyConceptsState, populatedAttributeState } from "storage/state/Annotate"
import { SectionProps } from "./Annotate"
import { parseJsonConfig } from "pages/annotate/ParseJsonConfig"
import { OntologyConcept } from "pages/dashboard/OntologyTable"
import notify from "utils/Notifications"
import Title from "components/title/Title"
import EntityConfig from "components/annotate/EntityConfig"
import AttributeConfig, { SelectData } from "components/annotate/AttributeConfig"
import { IConfig } from "pages/setup/ConfigTable"

function Config({ workspace }: SectionProps) {
  const [config, setConfig] = useState<IConfig>({ entities: [], globalAttributes: [] })
  const [entitySectionOpen, setEntitySectionOpen] = useState(true)
  const [attributeSectionOpen, setAttributeSectionOpen] = useState(true)
  const [ontologySectionOpen, setOntologySectionOpen] = useState(true)
  const [availableOntologies, setAvailableOntologies] = useState<SelectData[]>([])
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | null>(null)
  const [selectedOntologyConcepts, setSelectedOntologyConcepts] = useState<OntologyConcept[]>([])

  const setPopulatedAttributes = useSetRecoilState(populatedAttributeState)
  const setActiveOntologyConcept = useSetRecoilState(activeOntologyConceptsState)

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(configs => {
        if (configs.length > 0) {
          const config = parseJsonConfig(configs[0].content)

          setConfig(config)
        } else {
          notify.error("Failed to load workspace config.")
        }
      })
      .catch((e) => notify.error("Failed to load workspace config.", e))
  }, [setConfig, workspace.id])

  useEffect(() => {
    database
      .getWorkspaceOntologies(workspace.id)
      .then((ontologies) => {
        const data = ontologies.map(ontology => ({
          label: ontology.name,
          value: ontology.id,
        }))

        setAvailableOntologies(data)
      })
      .catch((e) => notify.error("Failed to load available ontologies.", e))
  }, [workspace.id])

  useEffect(() => {
    if (selectedOntologyId == null) {
      setSelectedOntologyConcepts([])
      setActiveOntologyConcept({ name: "", code: "" })
    } else {
      database
        .getOntologyConcepts(selectedOntologyId)
        .then(setSelectedOntologyConcepts)
        .catch((e) => notify.error("Failed to load ontology concepts.", e))
    }
  }, [selectedOntologyId, setActiveOntologyConcept])

  const clearPopulatedAttributes = () => {
    setPopulatedAttributes({})
  }

  const clearPopulatedOntologyConcepts = () => {
    setSelectedOntologyId(null)
    setSelectedOntologyConcepts([])
    setActiveOntologyConcept({ name: "", code: "" })
  }

  return (
    <Card shadow="xs" radius={5} p="xl">
      <ScrollArea scrollbarSize={0} sx={{ height: "76vh" }}>
        <Grid>
          <Grid.Col xs={12}>
            <Title
              text="Select entity"
              description="Select the entity you want to annotate."
              open={entitySectionOpen}
              setOpen={setEntitySectionOpen}
            />
          </Grid.Col>

          <Grid.Col xs={12}>
            <Collapse in={entitySectionOpen}>
              <EntityConfig config={config} />
            </Collapse>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Group position="apart">
              <Title
                text="Add attributes"
                open={attributeSectionOpen}
                setOpen={setAttributeSectionOpen}
              />

              <Button
                variant="subtle"
                onClick={clearPopulatedAttributes}
              >
                Clear
              </Button>
            </Group>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Collapse in={attributeSectionOpen}>
              <AttributeConfig config={config} />
            </Collapse>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Group position="apart">
              <Title
                text="Map to ontology"
                open={ontologySectionOpen}
                setOpen={setOntologySectionOpen}
              />

              <Button
                variant="subtle"
                onClick={clearPopulatedOntologyConcepts}
              >
                Clear
              </Button>
            </Group>
          </Grid.Col>

          <Grid.Col xs={12}>
            <Collapse in={ontologySectionOpen}>
              <Group mb={20}>
                <Grid sx={{ width: "100%" }}>
                  <Grid.Col xs={12}>
                    <Select
                      data={availableOntologies}
                      placeholder="Ontology"
                      size="sm"
                      searchable
                      onChange={setSelectedOntologyId}
                    />
                  </Grid.Col>

                  <Grid.Col xs={12}>
                    <Select
                      data={selectedOntologyConcepts.map(concept => {
                        return {
                          label: `${concept.name} (${concept.code})`,
                          value: concept.code,
                        }
                      })}
                      placeholder="Concept"
                      size="sm"
                      searchable
                      clearable
                      creatable
                      onChange={(code) => {
                        const name = selectedOntologyConcepts.find(concept => concept.code === code)?.name

                        setActiveOntologyConcept({
                          code: code ?? "",
                          name: name ?? "",
                        })
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Group>
            </Collapse>
          </Grid.Col>
        </Grid>
      </ScrollArea>
    </Card>
  )
}

export default Config
