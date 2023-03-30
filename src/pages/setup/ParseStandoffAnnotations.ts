import { RawAnnotation } from "storage/database"

function parseStandoffAnnotations(content: string) {
  const rawAnnotationMap: Record<string, RawAnnotation> = {}
  const lines = content.split("\n")

  for (const line of lines) {
    if (line.startsWith("T")) {
      const [id, annotation, text] = line.split("\t")
      const [entity, start, end] = annotation.split(" ")

      rawAnnotationMap[id] = {
        entity,
        start_index: parseInt(start),
        end_index: parseInt(end),
        attributes: {},
        text,
      }
    } else if (line.startsWith("A")) {
      const [_, attribute] = line.split("\t")
      const [name, targetId, value] = attribute.split(" ")

      if (rawAnnotationMap[targetId]) {
        if (!rawAnnotationMap[targetId].attributes[name]) {
          rawAnnotationMap[targetId].attributes[name] = []
        }

        rawAnnotationMap[targetId].attributes[name].push(value)
      }
    }
  }

  return Object.values(rawAnnotationMap)
}

export { parseStandoffAnnotations }
