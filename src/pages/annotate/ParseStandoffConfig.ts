import { WorkspaceConfig } from "storage/database/Database"

enum Config {
  GlobalAttributeKey = "<ENTITY>",
  TargetEntity = "Arg:",
  TargetEntitySeparator = ",",
  AttributeValue = "Value:",
  AttributeValueSeparator = "|",
}

export interface Attribute {
  name: string,
  options: string[],
  targetEntity: string,
  isGlobal: boolean,
}

function parseConfig(config: WorkspaceConfig) {
  return {
    entities: parseEntities(config.content),
    attributes: parseAttributes(config.content),
  }
}

function parseEntities(content: string) {
  return parseSection(content, "entities")
}

function parseAttributes(content: string): Attribute[] {
  const rawAttributes = parseSection(content, "attributes")
  const parsedAttribute: Attribute[] = []

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

    parsedAttribute.push({
      name: attributeName,
      options: attributeOptions,
      targetEntity: targetEntity,
      isGlobal: isGlobal,
    })
  })

  return parsedAttribute
}

function parseSection(content: string, category: string): string[] {
  const entities: string[] = []

  const lines = content.split("\n")
  let takeNextLine = false

  lines.forEach((line) => {
    const isHeader = isSectionHeader(line)

    if (isHeader && isTargetSectionHeader(line, category)) {
      takeNextLine = true
    } else if (isHeader) {
      takeNextLine = false
    } else if (takeNextLine) {
      const entity = line.trim()

      if (entity) {
        entities.push(entity)
      }
    }
  })

  return entities
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

export { parseConfig }
