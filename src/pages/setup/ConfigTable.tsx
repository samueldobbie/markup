import { Group, Button, ActionIcon, Text, FileButton, Card, Modal, Grid, MultiSelect, Select, TextInput, Divider } from "@mantine/core"
import { IconTrash } from "@tabler/icons"
import saveAs from "file-saver"
import { DataTable } from "mantine-datatable"
import { useEffect, useState } from "react"
import { WorkspaceConfig, database } from "storage/database/Database"
import { SectionProps } from "./Setup"

function ConfigTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [configs, setConfigs] = useState<WorkspaceConfig[]>([])
  const [openedModal, setOpenedModal] = useState(false)

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then(setConfigs)
  }, [workspace.id])

  useEffect(() => {
    if (file === null) return

    const func = async () => {
      database
        .addWorkspaceConfig(workspace.id, file)
        .then(insertedConfig => {
          setFile(null)
          setConfigs([insertedConfig])
        })
    }

    func()
  }, [configs, file, workspace.id])

  useEffect(() => {
    if (setWorkspaceStatus === undefined) return

    if (configs.length === 0 && workspaceStatus.hasConfig) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasConfig: false,
      })
    } else if (configs.length > 0 && !workspaceStatus.hasConfig) {
      setWorkspaceStatus({
        ...workspaceStatus,
        hasConfig: true,
      })
    }
  }, [configs, workspaceStatus, setWorkspaceStatus])

  return (
    <>
      <Card shadow="xs" radius={5}>
        <DataTable
          withBorder={false}
          emptyState="Upload or create a config"
          borderRadius={5}
          sx={{ minHeight: "500px" }}
          records={configs}
          rowExpansion={{
            content: (config) => (
              <Text
                p={20}
                mb={20}
                color="dimmed"
                lineClamp={4}
                sx={{
                  whiteSpace: "pre-line",
                  overflowX: "hidden",
                  width: "500px", // remove hardcoded
                }}
              >
                {config.record.content}
              </Text>
            )
          }}
          columns={[
            {
              accessor: "name",
              title: <Text size={16}>Config</Text>,
            },
            {
              accessor: "actions",
              title: (
                <Group spacing={4} position="right" noWrap>
                  <Button variant="subtle" onClick={() => setOpenedModal(true)}>
                    Create config
                  </Button>

                  <FileButton onChange={setFile} accept="plain/text">
                    {(props) => (
                      <Button {...props}>
                        Upload config
                      </Button>
                    )}
                  </FileButton>
                </Group>
              ),
              textAlignment: "right",
              render: (config) => (
                <Group spacing={4} position="right" noWrap>
                  <ActionIcon color="primary">
                    <IconTrash
                      size={16}
                      style={{ color: "rgb(217 138 138)" }}
                      onClick={(event) => {
                        event.stopPropagation()

                        database
                          .deleteWorkspaceConfig(config.id)
                          .then(() => setConfigs([]))
                          .catch(alert)
                      }}
                    />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
        />
      </Card>

      <ConfigCreatorModal
        openedModal={openedModal}
        setOpenedModal={setOpenedModal}
      />
    </>
  )
}

interface Props {
  openedModal: boolean
  setOpenedModal: (opened: boolean) => void
}

interface Attribute {
  entity: string
  name: string
  values: string[]
}

const GLOBAL_ATTRIBUTE_KEY = "global"

function ConfigCreatorModal({ openedModal, setOpenedModal }: Props) {
  const [entities, setEntities] = useState<string[]>([])
  const [entityValues, setEntityValues] = useState<{ value: string; label: string }[]>([])

  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [relatedEntity, setRelatedEntity] = useState<string>("")
  const [attributeName, setAttributeName] = useState<string>("")
  const [attributeValues, setAttributeValues] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setEntities(entityValues.map(({ value }) => value))
  }, [entityValues])

  const addAttribute = () => {
    const addedAttribute = {
      entity: relatedEntity,
      name: attributeName, // .split(" ").join("")
      values: attributeValues.map(({ value }) => value),
    } as Attribute

    const isUnique = attributes.filter((attribute) => (
      attribute.entity === addedAttribute.entity &&
      attribute.name === addedAttribute.name
    )).length === 0

    if (isUnique) {
      setAttributes([addedAttribute, ...attributes])
      setRelatedEntity("")
      setAttributeName("")
      setAttributeValues([])
    } else {
      alert("An attribute with that name already exists for the related entity.")
    }
  }

  const handleSaveConfig = () => {
    const fileName = "annotation.conf"
    const entitySection = buildEntitySection()
    const attributeSection = buildAttributeSection()
    const output = `${entitySection}\n\n${attributeSection}`
    const blob = new Blob([output], { type: "text/plain" })

    saveAs(blob, fileName)

    // todo: upload to db
  }

  const buildEntitySection = () => {
    const output = ["[entities]", ...entities]
    return output.join("\n")
  }

  const buildAttributeSection = () => {
    const output = ["[attributes]"]

    attributes.forEach((attribute) => {
      const { entity, name, values } = attribute

      if (entity === GLOBAL_ATTRIBUTE_KEY || entities.includes(entity)) {
        const valuesString = values.join("|")
        const attributeString = `${name} Arg:${entity}, Value:${valuesString}`
        output.push(attributeString)
      }
    })

    return output.join("\n")
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Config Creator"
      size="xl"
      centered
    >
      <Grid>
        <Grid.Col xs={6}>
          <Grid>
            <Grid.Col xs={12}>
              <Text size={16}>
                Entities
              </Text>

              <Text size={12} mb={10} color="dimmed">
                The high-level nouns/categories of information you want to capture during annotation (e.g. 'Person' and 'Prescription').
              </Text>

              <MultiSelect
                nothingFound="Start typing to create an entity"
                placeholder="Start typing to create an entity"
                data={entityValues}
                searchable
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const item = { value: query, label: query }
                  setEntityValues((current) => [...current, item])
                  return item
                }}
              />

              <Divider mt={20} mb={20} />

              <Text size={16}>
                Attributes (optional)
              </Text>

              <Text size={12} mb={10} color="dimmed">
                These are the properties of an entity (e.g. a 'Person' entity may have 'Name' and 'Date of Birth' attributes).
              </Text>

              <Select
                label="Related entity"
                placeholder="Select an entity"
                data={entities}
                mb={10}
                onChange={(value) => setRelatedEntity(value!)}
              />

              <TextInput
                label="Attribute name"
                placeholder="Attribute name (e.g. 'Name')"
                onChange={(event) => setAttributeName(event.target.value)}
              />

              <MultiSelect
                label="Attribute values"
                description="The possible values for this attribute (e.g. 'mg' and 'ml' for a 'Drug Dose' attribute)."
                nothingFound="Start typing to add attribute values"
                placeholder="Start typing to add attribute values"
                data={attributeValues}
                searchable
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const item = { value: query, label: query }
                  setAttributeValues([...attributeValues, item])
                  return item
                }}
              />

              <Button
                mt={10}
                variant="light"
                onClick={addAttribute}
              >
                Add attribute
              </Button>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        <Divider orientation="vertical" ml={10} mr={10} />

        <Grid.Col xs={5}>
          <Grid>
            <Grid.Col xs={12}>
              <Text size={16}>
                Output Preview
              </Text>

              <Text size={12} mt={15} color="dimmed">
                [entities]
              </Text>

              {entities.map((entity) => (
                <Text size={12} color="dimmed" key={entity}>
                  {entity}
                </Text>
              ))}

              <Text size={12} mt={15} color="dimmed">
                [attributes]
              </Text>

              {attributes.map((attribute) => {
                const { entity, name, values } = attribute

                const valuesString = values.join("|")
                const attributeString = `${name} Arg:${entity}, Value:${valuesString}`
                return (
                  <Text size={12} color="dimmed" key={attributeString}>
                    {attributeString}
                  </Text>
                )
              })}
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>

      <Group position="right">
        <Button onClick={handleSaveConfig}>
          Export & Use
        </Button>
      </Group>
    </Modal>
  )
}

export default ConfigTable
