import { useAnnotateStore } from "storage/state/Annotate"
import { Group, Radio } from "@mantine/core"
import { IConfig } from "pages/setup/ConfigTable"
import { useEffect, useState } from "react"
import { coloursForEntities } from "utils/EntityColour"

interface Props {
  config: IConfig
}

function EntityConfig({ config }: Props) {
  const [entityNames, setEntityNames] = useState<string[]>([])
  const activeEntity = useAnnotateStore((s) => s.activeEntity)
  const setActiveEntity = useAnnotateStore((s) => s.setActiveEntity)
  const activeTutorialStep = useAnnotateStore((s) => s.activeTutorialStep)
  const setActiveTutorialStep = useAnnotateStore((s) => s.setActiveTutorialStep)
  const entityColours = useAnnotateStore((s) => s.entityColours)
  const setEntityColours = useAnnotateStore((s) => s.setEntityColours)

  useEffect(() => {
    const entities = config.entities.map((entity) => entity.name)

    setEntityNames(entities)
  }, [config, setActiveEntity])

  useEffect(() => {
    setEntityColours(coloursForEntities(entityNames))
  }, [entityNames, setEntityColours])

  return (
    <Group mb={20}>
      <Radio.Group
        name="entities"
        onChange={(e) => {
          setActiveEntity(e)

          if (activeTutorialStep === 0) {
            setActiveTutorialStep(1)
          }
        }}
        value={activeEntity}
      >
        <Group gap="xs">
          {entityNames?.map((entityName, index) => (
            <Radio
              key={index}
              value={entityName}
              label={
                <span
                  onClick={() => setActiveEntity(entityName)}
                  style={{
                    backgroundColor: entityColours[entityName],
                    color: "#333333",
                    cursor: "pointer",
                    userSelect: "none",
                    borderRadius: 5,
                    padding: 5,
                  }}
                >
                  {entityName}
                </span>
              }
            />
          ))}
        </Group>
      </Radio.Group>
    </Group>
  )
}

export default EntityConfig
