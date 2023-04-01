import { RawAnnotation } from "storage/database";

function parseJsonAnnotations(content: string): RawAnnotation[] {
  return JSON.parse(content)
}

export { parseJsonAnnotations }
