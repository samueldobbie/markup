import { IConfig, IConfigEntity, IConfigAttribute } from "pages/setup/ConfigTable"

enum Config {
  GlobalAttributeKey = "<ENTITY>",
  TargetEntity = "Arg:",
  TargetEntitySeparator = ",",
  AttributeValue = "Value:",
  AttributeValueSeparator = "|",
}

function parseStandoffConfig(content: string): IConfig {
  const entities = [] as IConfigEntity[]
  const globalAttributes = [] as IConfigAttribute[]

  const rawEntities = parseSection(content, "entities")
  const rawAttributes = parseSection(content, "attributes")

  rawEntities.forEach((rawEntity: string) => {
    entities.push({
      name: rawEntity,
      attributes: [] as IConfigAttribute[],
    })
  })

  rawAttributes.forEach((rawAttribute: string) => {
    const attributeName = rawAttribute
      .split(Config.TargetEntity)[0]
      .trim()

    const attributeOptions = rawAttribute
      .split(Config.AttributeValue)[1]
      .trim()
      .split(Config.AttributeValueSeparator)
      .filter((option) => option !== "")

    const targetEntity = rawAttribute
      .split(Config.TargetEntity)[1]
      .split(Config.TargetEntitySeparator)[0]
      .trim()

    const isGlobal = targetEntity.toUpperCase() === Config.GlobalAttributeKey

    if (isGlobal) {
      globalAttributes.push({
        name: attributeName,
        values: attributeOptions,
        allowCustomValues: false,
      })
    } else {
      const targetEntityIndex = entities.findIndex(e => e.name === targetEntity)

      if (targetEntityIndex > -1) {
        entities[targetEntityIndex].attributes.push({
          name: attributeName,
          values: attributeOptions,
          allowCustomValues: false,
        })
      }
    }
  })

  return {
    entities,
    globalAttributes,
  }
}

function parseSection(content: string, category: string): string[] {
  const targetLines = [] as string[]

  let takeNextLine = false

  content.split("\n").forEach((line) => {
    const isHeader = isSectionHeader(line)
    const isTargetHeader = isTargetSectionHeader(line, category)

    if (isHeader && isTargetHeader) {
      takeNextLine = true
    } else if (isHeader) {
      takeNextLine = false
    } else if (takeNextLine) {
      const targetLine = line.trim()

      if (targetLine) {
        targetLines.push(targetLine)
      }
    }
  })

  return targetLines
}

function isSectionHeader(line: string): boolean {
  return (
    line.length >= 3 &&
    line[0] === "[" &&
    line[line.length - 1] === "]"
  )
}

function isTargetSectionHeader(line: string, category: string): boolean {
  return line.slice(1, line.length - 1).toLocaleLowerCase() === category
}

export { parseStandoffConfig }
