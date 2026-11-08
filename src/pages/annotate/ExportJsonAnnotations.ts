import saveAs from "file-saver"
import JSZip from "jszip"
import { WorkspaceAnnotation, WorkspaceDocumentName } from "storage/database"
import notify from "utils/Notifications"
import { exportFileNames } from "./ExportFileNames"

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

async function exportJsonAnnotations(documents: WorkspaceDocumentName[], annotations: WorkspaceAnnotation[][]): Promise<void> {
  const outputs = [] as AnnotationOutput2[]

  const names = exportFileNames(documents.map((doc) => doc.name), ".json")

  documents.forEach((_, index) => {
    const output = buildSingleOutput(names[index], annotations[index])
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
    .catch((e) => notify.error("Failed to export annotations.", e))
}

function buildSingleOutput(name: string, annotations: WorkspaceAnnotation[]): AnnotationOutput2 {
  return {
    name,
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
