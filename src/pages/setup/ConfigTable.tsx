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
  const [entityDropdownData, setEntityDropdownData] = useState<{ value: string; label: string }[]>([])

  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [attributeValues, setAttributeValues] = useState<string[]>([])
  const [attributeValueDropdownData, setAttributeValueDropdownData] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setEntities(entityDropdownData.map(({ value }) => value))
  }, [entityDropdownData])

  const addAttribute = (data: { entity: string, name: string }) => {
    const addedAttribute = {
      entity: data.entity,
      name: data.name.split(" ").join(""),
      values: attributeValues,
    } as Attribute

    const isUnique = attributes.filter((attribute) => (
      attribute.entity === addedAttribute.entity &&
      attribute.name === addedAttribute.name
    )).length === 0

    if (isUnique) {
      setAttributes([addedAttribute, ...attributes])
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
      centered
    >
      <Grid>
        <Grid.Col xs={12}>
          <MultiSelect
            label="Add entities"
            description="The high-level nouns/categories of information you want to capture during annotation (e.g. 'Prescription' and 'Date of Birth')."
            nothingFound="Start typing to create an entity"
            placeholder="Start typing to create an entity"
            data={entityDropdownData}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const item = { value: query, label: query }
              setEntityDropdownData((current) => [...current, item])
              return item
            }}
          />

          <Divider mt={20} mb={20} />

          <Text size={16}>
            Attributes (optional)
          </Text>

          <Text size={12} mb={10} color="dimmed">
            These are the granular properties of an entity (e.g. 'Drug Name' and 'Drug Dose' for the 'Prescription' entity).
          </Text>

          <Select
            label="Related entity"
            placeholder="Select an entity"
            data={entities}
            mb={10}
          />

          <TextInput
            label="Attribute name"
            placeholder="Attribute name (e.g. 'Drug Dose')"
          />

          <MultiSelect
            label="Attribute values"
            description="The possible values for this attribute (e.g. 'mg' and 'ml' for the 'Drug Dose' attribute)."
            nothingFound="Start typing to add an attribute value"
            placeholder="Start typing to add an attribute value"
            data={attributeValueDropdownData}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const item = { value: query, label: query }
              setAttributeValueDropdownData((current) => [...current, item])
              return item
            }}
          />

          <Button
            mt={10}
            variant="light"
            // onClick={addAttribute}
          >
            Add attribute
          </Button>

          <Grid.Col xs={12}>
            <Group position="right">
              <Button onClick={handleSaveConfig}>
                Export & Use
              </Button>
            </Group>
          </Grid.Col>
        </Grid.Col>
      </Grid>
    </Modal>
  )
}

export default ConfigTable
