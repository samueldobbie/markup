import { describe, expect, it } from "vitest"
import { parseJsonAnnotations } from "./ParseJsonAnnotations"
import { parseStandoffAnnotations } from "./ParseStandoffAnnotations"

describe("parseStandoffAnnotations", () => {
  it("parses text-bound annotations and their attributes", () => {
    const content = [
      "T1\tDrug 0 7\taspirin",
      "T2\tDose 8 12\t10mg",
      "A1\tUnit T2 mg",
      "A2\tRoute T1 oral",
      "A3\tRoute T1 iv",
    ].join("\n")

    expect(parseStandoffAnnotations(content)).toEqual([
      { entity: "Drug", start_index: 0, end_index: 7, text: "aspirin", attributes: { Route: ["oral", "iv"] } },
      { entity: "Dose", start_index: 8, end_index: 12, text: "10mg", attributes: { Unit: ["mg"] } },
    ])
  })

  it("ignores attributes that point at unknown annotations", () => {
    const content = "T1\tDrug 0 7\taspirin\nA1\tUnit T9 mg"

    expect(parseStandoffAnnotations(content)).toEqual([
      { entity: "Drug", start_index: 0, end_index: 7, text: "aspirin", attributes: {} },
    ])
  })

  it("handles CRLF line endings, blank lines and unsupported rows", () => {
    const content = "T1\tDrug 0 7\taspirin\r\n\r\nR1\tTreats Arg1:T1 Arg2:T2\r\n#1\tAnnotatorNotes T1\tnote\r\n"

    expect(parseStandoffAnnotations(content)).toEqual([
      { entity: "Drug", start_index: 0, end_index: 7, text: "aspirin", attributes: {} },
    ])
  })

  it("returns nothing for empty input", () => {
    expect(parseStandoffAnnotations("")).toEqual([])
  })
})

describe("parseJsonAnnotations", () => {
  it("parses an array of annotations", () => {
    const annotations = [
      { entity: "Drug", start_index: 0, end_index: 7, text: "aspirin", attributes: { Route: "oral" } },
    ]

    expect(parseJsonAnnotations(JSON.stringify(annotations))).toEqual(annotations)
  })

  it("throws on invalid JSON", () => {
    expect(() => parseJsonAnnotations("{not json")).toThrow(SyntaxError)
  })
})
