import saveAs from "file-saver"
import JSZip from "jszip"
import { WorkspaceAnnotation, WorkspaceAnnotator, WorkspaceDocumentName } from "storage/database"
import notify from "utils/Notifications"
import { exportFileNames } from "./ExportFileNames"

export interface ExportFile {
  name: string
  payload: string
}

export type BuildPayload = (annotations: WorkspaceAnnotation[]) => string

export interface AnnotatorGroup {
  folder: string
  annotations: WorkspaceAnnotation[][]
}

export const UNATTRIBUTED_FOLDER = "unattributed"

export function buildExportFiles(
  documents: WorkspaceDocumentName[],
  annotations: WorkspaceAnnotation[][],
  extension: string,
  buildPayload: BuildPayload,
  annotators?: WorkspaceAnnotator[],
): ExportFile[] {
  const names = exportFileNames(documents.map((doc) => doc.name), extension)

  const filesFor = (groupAnnotations: WorkspaceAnnotation[][], prefix: string) => documents.map((_, index) => ({
    name: `${prefix}${names[index]}`,
    payload: buildPayload(groupAnnotations[index] ?? []),
  }))

  if (!annotators) {
    return filesFor(annotations, "")
  }

  return groupByAnnotator(annotations, annotators)
    .flatMap((group) => filesFor(group.annotations, `${group.folder}/`))
}

export function groupByAnnotator(
  annotations: WorkspaceAnnotation[][],
  annotators: WorkspaceAnnotator[],
): AnnotatorGroup[] {
  const emails = new Map(annotators.map((annotator) => [annotator.id, annotator.email]))
  const groups = new Map<string, WorkspaceAnnotation[][]>()

  annotations.forEach((documentAnnotations, documentIndex) => {
    documentAnnotations.forEach((annotation) => {
      const key = annotation.user_id ?? ""

      if (!groups.has(key)) {
        groups.set(key, annotations.map(() => []))
      }

      groups.get(key)![documentIndex].push(annotation)
    })
  })

  const used = new Set<string>()

  return [...groups.entries()]
    .map(([userId, groupAnnotations]) => ({
      folder: folderName(userId ? emails.get(userId) ?? `user-${userId}` : UNATTRIBUTED_FOLDER),
      annotations: groupAnnotations,
    }))
    .sort((a, b) => a.folder.localeCompare(b.folder))
    .map((group) => {
      let folder = group.folder

      for (let suffix = 2; used.has(folder.toLowerCase()); suffix++) {
        folder = `${group.folder}-${suffix}`
      }

      used.add(folder.toLowerCase())
      return { ...group, folder }
    })
}

function folderName(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, "-")
}

export function saveAsZip(files: ExportFile[]): void {
  const zip = new JSZip()

  files.forEach((file) => {
    if (file.name) {
      zip.file(file.name, file.payload)
    }
  })

  zip
    .generateAsync({ type: "blob" })
    .then((content) => saveAs(content, "annotations.zip"))
    .catch((e) => notify.error("Failed to export annotations.", e))
}
