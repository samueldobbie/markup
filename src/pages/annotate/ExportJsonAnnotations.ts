import saveAs from "file-saver"
import JSZip from "jszip"
import { WorkspaceAnnotation, WorkspaceDocument } from "storage/database"
import notify from "utils/Notifications"

interface JsonOutput {
  entity: string
  start_index: number
  end_index: number
  text: string
  attributes: { [key: string]: string }
}

interface AnnotationOutput2 {
  name: string
  payload: string
}

async function exportJsonAnnotations(documents: WorkspaceDocument[], annotations: WorkspaceAnnotation[][]): Promise<void> {
  const outputs = [] as AnnotationOutput2[]

  documents.forEach((doc, index) => {
    const output = buildSingleOutput(doc.name, annotations[index])
    outputs.push(output)
  })

  saveAsZip(outputs)
}

function saveAsZip(outputs: AnnotationOutput2[]): void {
  const zip = new JSZip()

  outputs.forEach((output: AnnotationOutput2) => {
    if (output.name && output.payload) {
      zip.file(output.name, output.payload)
    }
  })

  zip
    .generateAsync({ type: "blob" })
    .then((content) => saveAs(content, "annotations.zip"))
    .catch(() => notify.error("Failed to export annotations. Please try again later."))
}

function buildSingleOutput(name: string, annotations: WorkspaceAnnotation[]): AnnotationOutput2 {
  return {
    name: name.split(".txt")[0] + ".json",
    payload: buildJsonOutputs(annotations),
  }
}

function buildJsonOutputs(annotations: WorkspaceAnnotation[]): string {
  const outputAnnotations: JsonOutput[] = []

  annotations.forEach((annotation: WorkspaceAnnotation) => {
    const { entity, start_index, end_index, text, attributes } = annotation

    const outputAnnotation = {
      entity,
      start_index,
      end_index,
      text,
      attributes,
    } as JsonOutput

    outputAnnotations.push(outputAnnotation)
  })

  return JSON.stringify(outputAnnotations, null, 2)
}

export { exportJsonAnnotations }
