import { RawAnnotation } from "storage/database";

function parseJsonAnnotation(content: string): RawAnnotation[] {
  return JSON.parse(content)
}

export { parseJsonAnnotation }
