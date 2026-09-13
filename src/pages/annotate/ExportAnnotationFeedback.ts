import saveAs from "file-saver"
import { Workspace } from "storage/database"
import { getAnnotationFeedbackExport } from "utils/AnnotationFeedback"
import notify from "utils/Notifications"

function exportFilename(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return `${cleaned || "workspace"}-feedback.json`
}

async function exportAnnotationFeedback(workspace: Workspace): Promise<void> {
  try {
    const payload = await getAnnotationFeedbackExport(workspace.id)
    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: "application/json;charset=utf-8" },
    )

    saveAs(blob, exportFilename(payload.workspace.name || workspace.name))
  } catch (caught) {
    notify.error("Failed to export AI feedback.", caught instanceof Error ? caught : undefined)
  }
}

export { exportAnnotationFeedback }
