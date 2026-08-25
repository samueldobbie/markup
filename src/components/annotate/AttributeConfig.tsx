import { useAnnotateStore } from "storage/state/Annotate"
import { Group, Grid, Select, Text, TextInput } from "@mantine/core"
import { IConfig, IConfigAttribute } from "pages/setup/ConfigTable"
import { useState, useEffect } from "react"

export interface SelectData {
  label: string
  value: string
}

interface Props {
  config: IConfig
}

function AttributeConfig({ config }: Props) {
  const activeEntity = useAnnotateStore((s) => s.activeEntity)

  const [shownAttributes, setShownAttributes] = useState<IConfigAttribute[]>([])
  const [attributeValues, setAttributeValues] = useState<Record<string, SelectData[]>>({})
  const populatedAttributes = useAnnotateStore((s) => s.populatedAttributes)
  const setPopulatedAttributes = useAnnotateStore((s) => s.setPopulatedAttributes)

  useEffect(() => {
    const shownAttributes = [...config.globalAttributes]
    const targetEntities = config.entities.filter(entity => entity.name === activeEntity)

    if (targetEntities.length > 0) {
      shownAttributes.push(...targetEntities[0].attributes)
    }

    setShownAttributes(shownAttributes)
  }, [activeEntity, config])

  useEffect(() => {
    const attributeValues: Record<string, SelectData[]> = {}

    shownAttributes.forEach(attribute => {
      attributeValues[attribute.name] = attribute.values.map(value => ({
        label: value,
        value,
      }))
    })

    setAttributeValues(attributeValues)
  }, [shownAttributes])

  return (
    <>
      {activeEntity === "" && shownAttributes.length === 0 &&
        <Text c="dimmed">
          Select entity to see attributes
        </Text>
      }

      {activeEntity !== "" && shownAttributes.length === 0 &&
        <Text c="dimmed">
          Selected entity has no attributes
        </Text>
      }

      {shownAttributes.length > 0 &&
        <Group mb={20}>
          <Grid style={{ width: "100%" }}>
            {shownAttributes.map((attribute, index) => {
              const predictedValue = populatedAttributes[attribute.name]
              const options = attributeValues[attribute.name] ?? []

              if (predictedValue && !options.map(value => value.value).includes(predictedValue)) {
                const copy = { ...attributeValues }
                const item = {
                  value: predictedValue,
                  label: predictedValue,
                }

                copy[attribute.name] = [...options, item]
                setAttributeValues(copy)
              }

              return (
                <Grid.Col span={12} key={index}>
                  {attribute.allowCustomValues ? (
                    <TextInput
                      placeholder={attribute.name}
                      size="sm"
                      value={populatedAttributes[attribute.name] ?? ""}
                      onChange={(event) => {
                        const copy = { ...populatedAttributes }
                        const value = event.currentTarget.value

                        if (value) {
                          copy[attribute.name] = value
                        } else {
                          delete copy[attribute.name]
                        }

                        setPopulatedAttributes(copy)
                      }}
                    />
                  ) : (
                    <Select
                      data={attributeValues[attribute.name] ?? []}
                      placeholder={attribute.name}
                      size="sm"
                      onChange={(value) => {
                        const copy = { ...populatedAttributes }

                        if (value) {
                          copy[attribute.name] = value
                        } else if (Object.keys(copy).includes(attribute.name)) {
                          delete copy[attribute.name]
                        }

                        setPopulatedAttributes(copy)
                      }}
                      searchable
                      clearable
                      value={populatedAttributes[attribute.name] ?? null}
                    />
                  )}
                </Grid.Col>
              )
            })}
          </Grid>
        </Group>
      }
    </>
  )
}

export default AttributeConfig
