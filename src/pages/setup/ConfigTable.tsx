import { Group, Button, ActionIcon, Text, FileButton, Card, Modal, Grid, MultiSelect, Select, TextInput, Divider, ScrollArea, Checkbox } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconTrashX } from "@tabler/icons"
import saveAs from "file-saver"
import { DataTable } from "mantine-datatable"
import { parseConfig } from "pages/annotate/ParseStandoffConfig"
import { useEffect, useState } from "react"
import JSONPretty from "react-json-pretty"
import { WorkspaceConfig, database } from "storage/database/Database"
import { SectionProps } from "./Setup"

interface Config {
  entities: ConfigEntity[]
  globalAttributes: ConfigAttribute[]
}

interface ConfigEntity {
  name: string
  attributes: ConfigAttribute[]
}

interface ConfigAttribute {
  name: string
  values: string[]
  allowCustomValues: boolean
  allowMultipleSelections: boolean
}

function ConfigTable({ workspace, workspaceStatus, setWorkspaceStatus }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [configs, setConfigs] = useState<WorkspaceConfig[]>([])
  const [openedModal, setOpenedModal] = useState(false)
  const [entityCount, setEntityCount] = useState(0)
  const [attributeCount, setAttributeCount] = useState(0)

  useEffect(() => {
    database
      .getWorkspaceConfig(workspace.id)
      .then((insertedConfigs) => {
        const parsedConfig = JSON.parse(insertedConfigs[0].content) as Config

        setConfigs(insertedConfigs)
        setEntityCount(parsedConfig.entities.length)
        setAttributeCount(parsedConfig.globalAttributes.length + parsedConfig.entities.reduce((acc, entity) => acc + entity.attributes.length, 0))
      })
  }, [workspace.id])

  useEffect(() => {
    if (file === null) return

    const func = async () => {
      const content = await file.text()

      database
        .addWorkspaceConfig(workspace.id, file.name, content)
        .then(insertedConfig => {
          const parsedConfig = parseConfig(insertedConfig)

          setFile(null)
          setConfigs([insertedConfig])
          setEntityCount(parsedConfig.entities.length)
          setAttributeCount(parsedConfig.attributes.length)
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
          sx={{ minHeight: "225px" }}
          records={configs}
          rowExpansion={{
            content: (config) => (
              <Text
                p={20}
                mb={20}
                color="dimmed"
                sx={{
                  whiteSpace: "pre-line",
                  overflowX: "hidden",
                }}
              >
                {config.record.content}
              </Text>
            )
          }}
          columns={[
            {
              accessor: "name",
              title: (
                <Text size={16}>
                  Config

                  <Text size={13} color="dimmed">
                    Required
                  </Text>
                </Text>
              ),
              render: (config) => (
                <>
                  <Text>
                    {config.name}
                  </Text>

                  <Text size="sm" color="dimmed">
                    {entityCount} entities - {attributeCount} attributes
                  </Text>
                </>
              ),
            },
            {
              accessor: "actions",
              title: (
                <Group position="right" noWrap>
                  <Button variant="subtle" onClick={() => setOpenedModal(true)}>
                    Create config
                  </Button>

                  <FileButton onChange={setFile} accept=".conf,.json">
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
                <Group spacing={8} position="right" noWrap>
                  <ActionIcon
                    color="primary"
                    onClick={() => {
                      database
                        .deleteWorkspaceConfig(config.id)
                        .then(() => setConfigs([]))
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

      <ConfigCreatorModal
        workspaceId={workspace.id}
        openedModal={openedModal}
        setOpenedModal={setOpenedModal}
      />
    </>
  )
}

interface Props {
  workspaceId: string
  openedModal: boolean
  setOpenedModal: (opened: boolean) => void
}

interface Attribute {
  entity: string
  name: string
  values: string[]
  allowCustomValues: boolean
  allowMultipleSelections: boolean
}

interface AddAttributeForm {
  entity: string
  name: string
  allowCustomValues: boolean
  allowMultipleSelections: boolean
}

const GLOBAL_ATTRIBUTE_KEY = "<ENTITY>"

function ConfigCreatorModal({ workspaceId, openedModal, setOpenedModal }: Props) {
  const [entities, setEntities] = useState<string[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [output, setOutput] = useState<Config>({
    entities: [],
    globalAttributes: [],
  })

  useEffect(() => {
    const updatedOutput: Config = {
      entities: [],
      globalAttributes: [],
    }

    entities.forEach((entity) => {
      const entityAttributes: ConfigAttribute[] = attributes
        .filter((attribute) => attribute.entity === entity)
        .map((attribute) => ({
          name: attribute.name,
          values: attribute.values,
          allowCustomValues: attribute.allowCustomValues,
          allowMultipleSelections: attribute.allowMultipleSelections,
        }))

      updatedOutput.entities.push({
        name: entity,
        attributes: entityAttributes,
      })
    })

    const globalAttributes: ConfigAttribute[] = attributes
      .filter((attribute) => attribute.entity === GLOBAL_ATTRIBUTE_KEY)
      .map((attribute) => ({
        name: attribute.name,
        values: attribute.values,
        allowCustomValues: attribute.allowCustomValues,
        allowMultipleSelections: attribute.allowMultipleSelections,
      }))

    updatedOutput.globalAttributes = globalAttributes

    setOutput(updatedOutput)
  }, [entities, attributes])

  const handleExportAndUseConfig = () => {
    const fileName = "annotation.json"
    const fileContent = JSON.stringify(output, null, 2)

    database
      .addWorkspaceConfig(workspaceId, fileName, fileContent)
      .then(() => {
        const blob = new Blob([fileContent], { type: "application/json" })
        saveAs(blob, fileName)
        window.location.reload()
      })
  }

  return (
    <Modal
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Config Creator"
      size={1000}
      centered
    >
      <Grid>
        <Grid.Col md={6}>
          <Grid>
            <Grid.Col xs={12}>
              <EntitySection
                entities={entities}
                setEntities={setEntities}
              />

              <Divider mt={20} mb={20} />

              <AttributeSection
                entities={entities}
                attributes={attributes}
                setAttributes={setAttributes}
              />
            </Grid.Col>
          </Grid>
        </Grid.Col>

        <Divider orientation="vertical" ml={10} mr={10} />

        <Grid.Col md={5}>
          <PreviewSection output={output} />
        </Grid.Col>
      </Grid>

      <Group position="right">
        <Button onClick={handleExportAndUseConfig}>
          Export & Use
        </Button>
      </Group>
    </Modal>
  )
}

interface EntitySectionProps {
  entities: string[]
  setEntities: (entities: string[]) => void
}

function EntitySection({ entities, setEntities }: EntitySectionProps) {
  return (
    <>
      <Text size={16}>
        Entities
      </Text>

      <Text size={12} mb={10} color="dimmed">
        The high-level nouns/categories of information you want to capture during annotation (e.g. 'Person' and 'Prescription').
      </Text>

      <MultiSelect
        nothingFound="Start typing to create an entity"
        placeholder="Start typing to create an entity"
        data={entities}
        searchable
        creatable
        onChange={(values) => setEntities(values)}
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={(query) => {
          setEntities([...entities, query])
          return query
        }}
      />
    </>
  )
}

interface AttributeSectionProps {
  entities: string[]
  attributes: Attribute[]
  setAttributes: (attributes: Attribute[]) => void
}

function AttributeSection({ entities, attributes, setAttributes }: AttributeSectionProps) {
  const [attributeValues, setAttributeValues] = useState<string[]>([])

  const form = useForm<AddAttributeForm>({
    initialValues: {
      entity: "",
      name: "",
      allowCustomValues: false,
      allowMultipleSelections: false,
    }
  })

  const handleAddAttribute = (submitted: AddAttributeForm) => {
    const addedAttribute: Attribute = {
      entity: submitted.entity,
      name: submitted.name,
      values: attributeValues,
      allowCustomValues: submitted.allowCustomValues,
      allowMultipleSelections: submitted.allowMultipleSelections,
    }

    const isUnique = attributes.filter((attribute) => (
      attribute.entity === addedAttribute.entity &&
      attribute.name === addedAttribute.name
    )).length === 0

    if (isUnique) {
      setAttributes([addedAttribute, ...attributes])
    } else {
      alert("An attribute with that name already exists for the related entity.")
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleAddAttribute)}>
      <Text size={16}>
        Attributes <span style={{ opacity: 0.5 }}>(optional)</span>
      </Text>

      <Text size={12} mb={10} color="dimmed">
        The properties of an entity (e.g. 'Name' and 'Date of Birth' for the 'Person' entity).
      </Text>

      <Select
        label="Related entity"
        placeholder="Select an entity"
        data={[...entities, { value: GLOBAL_ATTRIBUTE_KEY, label: "Global (attribute will apply to all entities)" }]}
        mb={15}
        {...form.getInputProps("entity")}
      />

      <TextInput
        label="Attribute name"
        placeholder="Attribute name (e.g. 'Name')"
        mb={15}
        {...form.getInputProps("name")}
      />

      <MultiSelect
        label="Attribute values"
        description="The possible values this attribute can have (e.g. 'mg' and 'ml' for a 'Drug Dose' attribute)."
        nothingFound="Start typing to add attribute values"
        placeholder="Start typing to add attribute values"
        data={attributeValues}
        searchable
        creatable
        mb={20}
        onChange={(values) => setAttributeValues(values)}
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={(query) => {
          setAttributeValues([...attributeValues, query])
          return query
        }}
      />

      <Checkbox
        mb={10}
        label={
          <>
            Allow custom attribute values

            <Text size={12} color="dimmed">
              Enable users to use custom values as they annotate.
            </Text>
          </>
        }
        {...form.getInputProps("allowCustomValues")}
      />

      <Checkbox
        mb={10}
        label={
          <>
            Allow selection of multiple attribute values

            <Text size={12} color="dimmed">
              Enable users to select multiple values as they annotate.
            </Text>
          </>
        }
        {...form.getInputProps("allowMultipleSelections")}
      />

      <Button
        mt={10}
        variant="light"
        type="submit"
      >
        Add attribute
      </Button>
    </form>
  )
}

interface PreviewSectionProps {
  output: Config
}

function PreviewSection({ output }: PreviewSectionProps) {
  return (
    <>
      <Text size={16}>
        Config Preview
      </Text>

      <ScrollArea sx={{
        height: 500,
        width: "110%",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        padding: 10,
        borderRadius: 5,
      }}>
        <Text size={14} mt={15} color="dimmed">
          <JSONPretty data={output} />
        </Text>
      </ScrollArea>
    </>
  )
}

export default ConfigTable
