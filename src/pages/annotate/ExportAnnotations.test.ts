import saveAs from "file-saver"
import JSZip from "jszip"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { parseStandoffAnnotations } from "pages/setup/ParseStandoffAnnotations"
import { WorkspaceAnnotation, WorkspaceDocumentName } from "storage/database"
import { exportJsonAnnotations } from "./ExportJsonAnnotations"
import { exportStandoffAnnotations } from "./ExportStandoffAnnotations"

vi.mock("file-saver", () => ({ default: vi.fn() }))
vi.mock("utils/Notifications", () => ({ default: { error: vi.fn(), info: vi.fn() } }))

function annotation(fields: Partial<WorkspaceAnnotation>): WorkspaceAnnotation {
  return {
    id: crypto.randomUUID(),
    created_at: "2026-01-01T00:00:00",
    workspace_id: "workspace",
    document_id: "document",
    entity: "Drug",
    start_index: 0,
    end_index: 0,
    attributes: {},
    text: "",
    ...fields,
  }
}

const documents: WorkspaceDocumentName[] = [
  { id: "doc-1", name: "note-1.txt" },
  { id: "doc-2", name: "note-2.txt" },
]

const annotations: WorkspaceAnnotation[][] = [
  [
    annotation({ entity: "Drug", start_index: 0, end_index: 7, text: "aspirin", attributes: { Route: "oral" } }),
    annotation({ entity: "Dose", start_index: 8, end_index: 17, text: "10 mg\tdaily", attributes: {} }),
  ],
  [
    annotation({ entity: "Condition", start_index: 4, end_index: 12, text: "migraine", attributes: { Negated: "no", Severity: "mild" } }),
  ],
]

async function savedZip(): Promise<{ name: string, zip: JSZip }> {
  await vi.waitFor(() => expect(saveAs).toHaveBeenCalledTimes(1))

  const [blob, name] = vi.mocked(saveAs).mock.calls[0] as [Blob, string]

  return { name, zip: await JSZip.loadAsync(await blob.arrayBuffer()) }
}

beforeEach(() => {
  vi.mocked(saveAs).mockClear()
})

describe("exportStandoffAnnotations", () => {
  it("writes one .ann file per document with numbered T and A rows", async () => {
    await exportStandoffAnnotations(documents, annotations)

    const { name, zip } = await savedZip()

    expect(name).toBe("annotations.zip")
    expect(Object.keys(zip.files).sort()).toEqual(["note-1.ann", "note-2.ann"])
    expect(await zip.file("note-1.ann")!.async("string")).toBe([
      "T1\tDrug 0 7\taspirin",
      "A1\tRoute T1 oral",
      "T2\tDose 8 17\t10-mg-daily",
      "",
    ].join("\n"))
    expect(await zip.file("note-2.ann")!.async("string")).toBe([
      "T1\tCondition 4 12\tmigraine",
      "A1\tNegated T1 no",
      "A2\tSeverity T1 mild",
      "",
    ].join("\n"))
  })

  it("produces output that the standoff parser reads back", async () => {
    await exportStandoffAnnotations(documents, annotations)

    const { zip } = await savedZip()
    const parsed = parseStandoffAnnotations(await zip.file("note-2.ann")!.async("string"))

    expect(parsed).toEqual([
      {
        entity: "Condition",
        start_index: 4,
        end_index: 12,
        text: "migraine",
        attributes: { Negated: ["no"], Severity: ["mild"] },
      },
    ])
  })
})

describe("exportJsonAnnotations", () => {
  it("writes one .json file per document with only the exported fields", async () => {
    await exportJsonAnnotations(documents, annotations)

    const { name, zip } = await savedZip()

    expect(name).toBe("annotations.zip")
    expect(Object.keys(zip.files).sort()).toEqual(["note-1.json", "note-2.json"])
    expect(JSON.parse(await zip.file("note-1.json")!.async("string"))).toEqual([
      { entity: "Drug", start_index: 0, end_index: 7, text: "aspirin", attributes: { Route: "oral" } },
      { entity: "Dose", start_index: 8, end_index: 17, text: "10 mg\tdaily", attributes: {} },
    ])
  })
})
