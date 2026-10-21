import { describe, expect, it } from "vitest"
import { MAX_DOCUMENT_SUGGESTIONS, MAX_OCCURRENCES_PER_SPAN, WorkspaceConfigPayload } from "./types.js"
import { filterSuggestedAttributes, filterSuggestedEntity, resolveDocumentSuggestions } from "./validate.js"

describe("filterSuggestedEntity", () => {
  it("keeps entities from the workspace config", () => {
    expect(filterSuggestedEntity("Drug", ["Drug", "Dose"])).toBe("Drug")
  })

  it.each([["Unknown"], [""], [42], [null], [undefined]])("drops %j", (entity) => {
    expect(filterSuggestedEntity(entity, ["Drug"])).toBe("")
  })
})

describe("filterSuggestedAttributes", () => {
  const attributes = [
    { name: "Dose", values: [], allowCustomValues: true },
    { name: "Unit", values: ["mg", "ml"], allowCustomValues: false },
    { name: "Route", values: ["oral"], allowCustomValues: true },
  ]

  it("keeps configured attributes whose values appear in the span", () => {
    expect(filterSuggestedAttributes({ Dose: "10", Unit: "mg" }, "10 mg daily", attributes))
      .toEqual({ Dose: "10", Unit: "mg" })
  })

  it("matches values in the span case-insensitively", () => {
    expect(filterSuggestedAttributes({ Route: "ORAL" }, "taken oral", attributes)).toEqual({ Route: "ORAL" })
  })

  it("drops unknown attributes, values outside the span and blank or non-string values", () => {
    expect(filterSuggestedAttributes(
      { Frequency: "daily", Dose: "20", Route: "  ", Unit: 5 },
      "10 mg daily",
      attributes,
    )).toEqual({})
  })

  it("drops values outside a closed value list", () => {
    expect(filterSuggestedAttributes({ Unit: "g" }, "10 g", attributes)).toEqual({})
  })

  it("allows custom values when the attribute permits them", () => {
    expect(filterSuggestedAttributes({ Route: "iv" }, "given iv", attributes)).toEqual({ Route: "iv" })
  })

  it.each([[null], ["Dose"], [["Dose"]]])("returns nothing for a %j payload", (parsed) => {
    expect(filterSuggestedAttributes(parsed, "10 mg", attributes)).toEqual({})
  })
})

describe("resolveDocumentSuggestions", () => {
  const config: WorkspaceConfigPayload = {
    entities: [
      { name: "Drug", attributes: [{ name: "Route", values: [], allowCustomValues: true }] },
      { name: "Condition", attributes: [] },
    ],
    globalAttributes: [{ name: "Negated", values: ["yes", "no"], allowCustomValues: false }],
  }

  const strip = (suggestions: ReturnType<typeof resolveDocumentSuggestions>) => (
    suggestions.map(({ id: _id, ...rest }) => rest)
  )

  it("resolves text spans to every non-overlapping occurrence", () => {
    const document = "Aspirin for migraine. Later, aspirin again."
    const suggestions = resolveDocumentSuggestions(
      { annotations: [{ entity: "Drug", text_span: "aspirin", attributes: { Route: "aspirin" } }] },
      document,
      [],
      config,
    )

    expect(strip(suggestions)).toEqual([
      { entity: "Drug", text: "aspirin", start_index: 29, end_index: 36, attributes: { Route: "aspirin" } },
    ])
    expect(suggestions[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it("falls back to a case-insensitive match and keeps the document's casing", () => {
    expect(strip(resolveDocumentSuggestions(
      [{ entity: "Condition", text: "MIGRAINE" }],
      "History of Migraine.",
      [],
      config,
    ))).toEqual([
      { entity: "Condition", text: "Migraine", start_index: 11, end_index: 19, attributes: {} },
    ])
  })

  it("skips spans that overlap existing annotations or earlier suggestions", () => {
    const document = "aspirin aspirin aspirin"
    const suggestions = resolveDocumentSuggestions(
      {
        suggestions: [
          { entity: "Drug", text_span: "aspirin" },
          { entity: "Condition", text_span: "pirin asp" },
        ],
      },
      document,
      [{ start_index: 0, end_index: 7 }],
      config,
    )

    expect(strip(suggestions).map(({ start_index, end_index }) => [start_index, end_index]))
      .toEqual([[8, 15], [16, 23]])
  })

  it("drops unknown entities, blank or too-short spans and spans missing from the document", () => {
    expect(resolveDocumentSuggestions(
      {
        annotations: [
          { entity: "Unknown", text_span: "aspirin" },
          { entity: "Drug", text_span: "  " },
          { entity: "Drug", text_span: "a" },
          { entity: "Drug", text_span: "ibuprofen" },
          "not an object",
        ],
      },
      "aspirin",
      [],
      config,
    )).toEqual([])
  })

  it("filters attributes against the entity and global config", () => {
    const [suggestion] = resolveDocumentSuggestions(
      { annotations: [{ entity: "Condition", text_span: "no migraine", attributes: { Negated: "no", Route: "no" } }] },
      "There was no migraine.",
      [],
      config,
    )

    expect(suggestion.attributes).toEqual({ Negated: "no" })
  })

  it("caps occurrences per span and total suggestions", () => {
    const document = Array.from({ length: 40 }, (_, index) => `w${String(index).padStart(2, "0")} x`).join(" ")
    const perSpan = resolveDocumentSuggestions({ annotations: [{ entity: "Drug", text_span: " x" }] }, document, [], config)

    expect(perSpan).toHaveLength(MAX_OCCURRENCES_PER_SPAN)

    const many = Array.from({ length: 40 }, (_, index) => ({
      entity: "Drug",
      text_span: `w${String(index).padStart(2, "0")}`,
    }))

    expect(resolveDocumentSuggestions({ annotations: many }, document, [], config)).toHaveLength(MAX_DOCUMENT_SUGGESTIONS)
  })

  it("returns nothing for unrecognised payloads", () => {
    expect(resolveDocumentSuggestions({ results: [] }, "aspirin", [], config)).toEqual([])
    expect(resolveDocumentSuggestions(null, "aspirin", [], config)).toEqual([])
  })
})
