import { WorkspaceAnnotation, WorkspaceAnnotator, WorkspaceDocumentName } from "storage/database"
import { buildExportFiles, saveAsZip } from "./ExportZip"

async function exportStandoffAnnotations(
  documents: WorkspaceDocumentName[],
  annotations: WorkspaceAnnotation[][],
  annotators?: WorkspaceAnnotator[],
): Promise<void> {
  saveAsZip(buildExportFiles(documents, annotations, ".ann", (rows) => buildExportRows(rows).join(""), annotators))
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
