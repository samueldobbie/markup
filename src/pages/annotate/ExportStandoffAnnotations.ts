import saveAs from "file-saver"
import JSZip from "jszip"
import { WorkspaceAnnotation, WorkspaceDocument } from "storage/database"

interface AnnotationOutput {
  name: string
  payload: string[]
}

async function exportStandoffAnnotations(documents: WorkspaceDocument[], annotations: WorkspaceAnnotation[][]): Promise<void> {
  const outputs = [] as AnnotationOutput[]

  documents.forEach((doc, index) => {
    const name = doc.name
    const output = buildSingleOutput(name, annotations[index])

    outputs.push(output)
  })

  saveAsZip(outputs)
}

function saveAsZip(outputs: AnnotationOutput[]): void {
  const zip = new JSZip()

  outputs.forEach((output: AnnotationOutput) => {
    if (output.name && output.payload) {
      zip.file(output.name, output.payload.join(""))
    }
  })

  zip
    .generateAsync({ type: "blob" })
    .then((content) => saveAs(content, "annotations.zip"))
    .catch(() => console.error("Failed to export annotations. Please try again later."))
}

function buildSingleOutput(name: string, annotations: WorkspaceAnnotation[]): AnnotationOutput {
  return {
    name: name.split(".txt")[0] + ".ann",
    payload: buildExportRows(annotations),
  }
}

function buildExportRows(annotations: WorkspaceAnnotation[]): string[] {
  const rows = [] as string[]

  let annotationId = 1
  let attributeId = 1

  const addAnnotationRow = (annotation: WorkspaceAnnotation) => {
    const { entity, start_index, end_index, text } = annotation
    const normalizedText = normalizeText(text)
    const output = `T${annotationId}\t${entity} ${start_index} ${end_index}\t${normalizedText}\n`
    rows.push(output)
  }

  const addAttributeRow = (annotation: WorkspaceAnnotation) => {
    const { attributes } = annotation

    Object.entries(attributes).forEach(([name, value]) => {
      const output = `A${attributeId}\t${name} T${annotationId} ${value}\n`
      rows.push(output)
      attributeId++
    })
  }

  annotations.forEach((annotation: WorkspaceAnnotation) => {
    addAnnotationRow(annotation)
    addAttributeRow(annotation)
    annotationId++
  })

  return rows
}

function normalizeText(text: string): string {
  return text
    .split(/ |\n|\t/)
    .join("-")
}

export { exportStandoffAnnotations }
