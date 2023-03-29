import { Group, Radio } from "@mantine/core"
import distinctColors from "distinct-colors"
import { IConfig } from "pages/setup/ConfigTable"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import { activeEntityState, activeTutorialStepState, entityColoursState } from "storage/state"

interface Props {
  config: IConfig
}

function EntityConfig({ config }: Props): JSX.Element {
  const [entityNames, setEntityNames] = useState<string[]>([])
  const [activeEntity, setActiveEntity] = useRecoilState(activeEntityState)
  const [activeTutorialStep, setActiveTutorialStep] = useRecoilState(activeTutorialStepState)
  const [entityColours, setEntityColours] = useRecoilState(entityColoursState)

  useEffect(() => {
    const entities = config.entities.map((entity) => entity.name)

    setEntityNames(entities)
  }, [config, setActiveEntity])

  useEffect(() => {
    const colours: Record<string, string> = {}

    const palette = distinctColors({
      count: entityNames.length,
      lightMin: 80,
    })

    entityNames.forEach((entityName, index) => {
      colours[entityName] = palette[index].hex()
    })

    setEntityColours(colours)
  }, [entityNames, setEntityColours])

  return (
    <Group mb={20}>
      <Radio.Group
        name="entities"
        orientation="horizontal"
        onChange={(e) => {
          setActiveEntity(e)

          if (activeTutorialStep === 0) {
            setActiveTutorialStep(1)
          }
        }}
        spacing="xs"
        value={activeEntity}
      >
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
      </Radio.Group>
    </Group>
  )
}

export default EntityConfig
