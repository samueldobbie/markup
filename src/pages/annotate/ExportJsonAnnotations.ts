import { WorkspaceAnnotation, WorkspaceAnnotator, WorkspaceDocumentName } from "storage/database"
import { buildExportFiles, saveAsZip } from "./ExportZip"

interface JsonOutput {
  entity: string
  start_index: number
  end_index: number
  text: string
  attributes: { [key: string]: string }
}

async function exportJsonAnnotations(
  documents: WorkspaceDocumentName[],
  annotations: WorkspaceAnnotation[][],
  annotators?: WorkspaceAnnotator[],
): Promise<void> {
  saveAsZip(buildExportFiles(documents, annotations, ".json", buildJsonOutputs, annotators))
}

function buildJsonOutputs(annotations: WorkspaceAnnotation[]): string {
  const outputAnnotations: JsonOutput[] = annotations.map(({ entity, start_index, end_index, text, attributes }) => ({
    entity,
    start_index,
    end_index,
    text,
    attributes,
  }))

  return JSON.stringify(outputAnnotations, null, 2)
}

export { exportJsonAnnotations }
