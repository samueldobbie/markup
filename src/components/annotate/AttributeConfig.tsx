import { Group, Grid, Select, Text } from "@mantine/core"
import { IConfig, IConfigAttribute } from "pages/setup/ConfigTable"
import { useState, useEffect } from "react"
import uuid from "react-uuid"
import { useRecoilState, useRecoilValue } from "recoil"
import { activeEntityState, populatedAttributeState } from "storage/state"

export interface SelectData {
  label: string
  value: string
}

interface Props {
  config: IConfig
}

function AttributeConfig({ config }: Props): JSX.Element {
  const activeEntity = useRecoilValue(activeEntityState)

  const [shownAttributes, setShownAttributes] = useState<IConfigAttribute[]>([])
  const [attributeValues, setAttributeValues] = useState<Record<string, SelectData[]>>({})
  const [populatedAttributes, setPopulatedAttributes] = useRecoilState(populatedAttributeState)

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
        <Text color="dimmed">
          Select entity to see attributes
        </Text>
      }

      {activeEntity !== "" && shownAttributes.length === 0 &&
        <Text color="dimmed">
          Selected entity has no attributes
        </Text>
      }

      {shownAttributes.length > 0 &&
        <Group mb={20}>
          <Grid sx={{ width: "100%" }}>
            {shownAttributes.map((attribute, index) => {
              const predictedValue = populatedAttributes[attribute.name]

              if (predictedValue && !attributeValues[attribute.name].map(value => value.value).includes(predictedValue)) {
                const copy = { ...attributeValues }
                const item = {
                  value: predictedValue,
                  label: predictedValue,
                }

                copy[attribute.name].push(item)
                setAttributeValues(copy)
              }

              return (
                <Grid.Col xs={12} key={index}>
                  <Select
                    key={uuid()}
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
                    creatable={attribute.allowCustomValues ?? false}
                    getCreateLabel={(query) => `+ Create ${query}`}
                    onCreate={(query) => {
                      const copy = { ...attributeValues }
                      const item = {
                        value: query,
                        label: query,
                      }

                      if (Object.keys(copy).includes(attribute.name)) {
                        copy[attribute.name].push(item)
                      } else {
                        copy[attribute.name] = [item]
                      }

                      setAttributeValues(copy)

                      return item
                    }}
                    value={populatedAttributes[attribute.name] ?? null}
                  />
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
