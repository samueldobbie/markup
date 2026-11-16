import { describe, expect, it } from "vitest"
import type { WorkspaceAnnotation } from "storage/database"
import {
  compareAnnotations,
  groupAnnotations,
  interpretAgreement,
  krippendorffAlpha,
  scoreAllPairs,
  scorePair,
  sharedDocumentIds,
  tokenLabels,
  tokenise,
} from "./Agreement"

let nextId = 0

function annotation(
  userId: string | null,
  entity: string,
  start: number,
  end: number,
  fields: Partial<WorkspaceAnnotation> = {},
): WorkspaceAnnotation {
  return {
    id: `annotation-${nextId++}`,
    created_at: "2026-01-01T00:00:00",
    workspace_id: "workspace-1",
    document_id: "doc-1",
    entity,
    start_index: start,
    end_index: end,
    attributes: {},
    text: "",
    user_id: userId,
    ...fields,
  }
}

const document = { id: "doc-1", content: "aa bb cc dd" }

describe("groupAnnotations", () => {
  it("groups by document and annotator and skips unattributed annotations", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 2),
      annotation("bob", "Drug", 0, 2),
      annotation(null, "Drug", 3, 5),
      annotation("ann", "Drug", 0, 2, { document_id: "doc-2" }),
    ])

    expect(grouped.get("doc-1")?.get("ann")).toHaveLength(1)
    expect(grouped.get("doc-1")?.size).toBe(2)
    expect(sharedDocumentIds(grouped)).toEqual(["doc-1"])
  })
})

describe("compareAnnotations", () => {
  it("classifies matches, attribute, boundary and entity differences", () => {
    const comparisons = compareAnnotations(
      [
        annotation("ann", "Drug", 0, 2),
        annotation("ann", "Dose", 3, 5, { attributes: { Unit: "mg" } }),
        annotation("ann", "Drug", 6, 8),
        annotation("ann", "Drug", 9, 11),
        annotation("ann", "Person", 20, 25),
      ],
      [
        annotation("bob", "Drug", 0, 2),
        annotation("bob", "Dose", 3, 5, { attributes: { Unit: "g" } }),
        annotation("bob", "Drug", 6, 11),
        annotation("bob", "Dose", 30, 35),
      ],
    )

    expect(comparisons.map(({ kind }) => kind)).toEqual([
      "match",
      "attributes",
      "boundary",
      "only_a",
      "only_a",
      "only_b",
    ])
  })

  it("treats the same span with different entities as an entity disagreement", () => {
    const comparisons = compareAnnotations(
      [annotation("ann", "Drug", 0, 2)],
      [annotation("bob", "Dose", 0, 2)],
    )

    expect(comparisons).toHaveLength(1)
    expect(comparisons[0].kind).toBe("entity")
  })

  it("ignores attribute key order", () => {
    const comparisons = compareAnnotations(
      [annotation("ann", "Drug", 0, 2, { attributes: { a: "1", b: "2" } })],
      [annotation("bob", "Drug", 0, 2, { attributes: { b: "2", a: "1" } })],
    )

    expect(comparisons[0].kind).toBe("match")
  })

  it("prefers an exact match over an earlier overlapping span", () => {
    const comparisons = compareAnnotations(
      [annotation("ann", "Drug", 0, 5), annotation("ann", "Drug", 3, 8)],
      [annotation("bob", "Drug", 3, 8)],
    )

    expect(comparisons.map(({ kind }) => kind)).toEqual(["only_a", "match"])
  })
})

describe("tokenLabels", () => {
  it("labels each token with the entity that covers most of it", () => {
    const tokens = tokenise("aa bbbb cc")

    expect(tokens).toEqual([
      { start: 0, end: 2 },
      { start: 3, end: 7 },
      { start: 8, end: 10 },
    ])

    expect(tokenLabels(tokens, [
      annotation("ann", "Drug", 0, 4),
      annotation("ann", "Dose", 4, 7),
    ])).toEqual(["Drug", "Dose", ""])
  })
})

describe("scorePair", () => {
  it("returns perfect scores for identical annotations", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 2),
      annotation("ann", "Dose", 6, 8),
      annotation("bob", "Drug", 0, 2),
      annotation("bob", "Dose", 6, 8),
    ])

    const score = scorePair([document], grouped, "ann", "bob")

    expect(score.exact.f1).toBe(1)
    expect(score.overlap.f1).toBe(1)
    expect(score.kappa).toBe(1)
    expect(score.documentCount).toBe(1)
    expect(score.tokenCount).toBe(4)
  })

  it("computes exact and relaxed F1 and token-level kappa", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 5),
      annotation("bob", "Drug", 0, 2),
    ])

    const score = scorePair([document], grouped, "ann", "bob")

    expect(score.exact).toEqual({ matched: 0, onlyA: 1, onlyB: 1, f1: 0 })
    expect(score.overlap).toEqual({ matched: 1, onlyA: 0, onlyB: 0, f1: 1 })
    expect(score.kappa).toBeCloseTo(0.5)
  })

  it("breaks scores down by entity and document", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 2),
      annotation("ann", "Dose", 3, 5),
      annotation("bob", "Drug", 0, 2),
      annotation("bob", "Dose", 6, 8),
    ])

    const score = scorePair([document], grouped, "ann", "bob")

    expect(score.exact.f1).toBeCloseTo(0.5)
    expect(score.entities).toEqual([
      {
        entity: "Dose",
        countA: 1,
        countB: 1,
        exact: { matched: 0, onlyA: 1, onlyB: 1, f1: 0 },
        overlap: { matched: 0, onlyA: 1, onlyB: 1, f1: 0 },
      },
      {
        entity: "Drug",
        countA: 1,
        countB: 1,
        exact: { matched: 1, onlyA: 0, onlyB: 0, f1: 1 },
        overlap: { matched: 1, onlyA: 0, onlyB: 0, f1: 1 },
      },
    ])
    expect(score.documents).toHaveLength(1)
    expect(score.documents[0].countA).toBe(2)
  })

  it("only counts documents both annotators have annotated", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 2),
      annotation("bob", "Drug", 0, 2),
      annotation("ann", "Drug", 0, 2, { document_id: "doc-2" }),
    ])

    const score = scorePair([document, { id: "doc-2", content: "aa bb" }], grouped, "ann", "bob")

    expect(score.documentCount).toBe(1)
    expect(score.exact.f1).toBe(1)
  })

  it("has no pair score when annotators share no documents", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 2),
      annotation("bob", "Drug", 0, 2, { document_id: "doc-2" }),
    ])

    expect(scoreAllPairs([document, { id: "doc-2", content: "aa" }], grouped, ["ann", "bob"])).toEqual([])
  })
})

describe("krippendorffAlpha", () => {
  it("matches a hand-computed nominal alpha for two annotators", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 5),
      annotation("bob", "Drug", 0, 2),
    ])

    const score = krippendorffAlpha([document], grouped)

    expect(score.alpha).toBeCloseTo(8 / 15)
    expect(score).toMatchObject({ documentCount: 1, tokenCount: 4, annotatorCount: 2 })
  })

  it("handles a different set of annotators per document", () => {
    const grouped = groupAnnotations([
      annotation("ann", "Drug", 0, 2),
      annotation("bob", "Drug", 0, 2),
      annotation("cat", "Drug", 0, 2),
      annotation("ann", "Dose", 0, 2, { document_id: "doc-2" }),
      annotation("cat", "Dose", 0, 2, { document_id: "doc-2" }),
      annotation("bob", "Dose", 0, 2, { document_id: "doc-3" }),
    ])

    const score = krippendorffAlpha([
      document,
      { id: "doc-2", content: "aa bb" },
      { id: "doc-3", content: "aa bb" },
    ], grouped)

    expect(score.alpha).toBe(1)
    expect(score).toMatchObject({ documentCount: 2, tokenCount: 6, annotatorCount: 3 })
  })

  it("is null without overlapping annotators", () => {
    const grouped = groupAnnotations([annotation("ann", "Drug", 0, 2)])

    expect(krippendorffAlpha([document], grouped).alpha).toBeNull()
  })
})

describe("interpretAgreement", () => {
  it("uses the Landis and Koch bands", () => {
    expect(interpretAgreement(null)).toBe("Not enough data")
    expect(interpretAgreement(-0.1)).toBe("Poor")
    expect(interpretAgreement(0.5)).toBe("Moderate")
    expect(interpretAgreement(0.75)).toBe("Substantial")
    expect(interpretAgreement(0.9)).toBe("Almost perfect")
  })
})
