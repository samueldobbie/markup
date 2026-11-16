import type { WorkspaceAnnotation } from "storage/database"

export type ComparisonKind = "match" | "attributes" | "boundary" | "entity" | "only_a" | "only_b"

export interface Comparison {
  kind: ComparisonKind
  a: WorkspaceAnnotation | null
  b: WorkspaceAnnotation | null
  start: number
}

export interface SpanScore {
  matched: number
  onlyA: number
  onlyB: number
  f1: number | null
}

export interface EntityScore {
  entity: string
  countA: number
  countB: number
  exact: SpanScore
  overlap: SpanScore
}

export interface DocumentScore {
  documentId: string
  countA: number
  countB: number
  exact: SpanScore
  overlap: SpanScore
  kappa: number | null
}

export interface PairScore {
  userA: string
  userB: string
  documentCount: number
  tokenCount: number
  exact: SpanScore
  overlap: SpanScore
  kappa: number | null
  entities: EntityScore[]
  documents: DocumentScore[]
}

export interface AlphaScore {
  alpha: number | null
  documentCount: number
  tokenCount: number
  annotatorCount: number
}

export interface AgreementDocument {
  id: string
  content: string
}

export type AnnotationsByDocument = Map<string, Map<string, WorkspaceAnnotation[]>>

const OUTSIDE = ""

export function groupAnnotations(annotations: WorkspaceAnnotation[]): AnnotationsByDocument {
  const grouped: AnnotationsByDocument = new Map()

  annotations.forEach((annotation) => {
    if (!annotation.user_id) {
      return
    }

    const byUser = grouped.get(annotation.document_id) ?? new Map<string, WorkspaceAnnotation[]>()
    const group = byUser.get(annotation.user_id) ?? []

    group.push(annotation)
    byUser.set(annotation.user_id, group)
    grouped.set(annotation.document_id, byUser)
  })

  return grouped
}

export function sharedDocumentIds(grouped: AnnotationsByDocument): string[] {
  return [...grouped.entries()]
    .filter(([, byUser]) => byUser.size >= 2)
    .map(([documentId]) => documentId)
}

function overlapLength(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.min(aEnd, bEnd) - Math.max(aStart, bStart)
}

function sameSpan(a: WorkspaceAnnotation, b: WorkspaceAnnotation): boolean {
  return a.start_index === b.start_index && a.end_index === b.end_index
}

function overlaps(a: WorkspaceAnnotation, b: WorkspaceAnnotation): boolean {
  return overlapLength(a.start_index, a.end_index, b.start_index, b.end_index) > 0
}

function normaliseAttributes(attributes: unknown): string {
  if (!attributes || typeof attributes !== "object") {
    return "{}"
  }

  const entries = Object.entries(attributes as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  return JSON.stringify(entries)
}

function bySpan(a: WorkspaceAnnotation, b: WorkspaceAnnotation): number {
  return a.start_index - b.start_index
    || a.end_index - b.end_index
    || (a.entity < b.entity ? -1 : a.entity > b.entity ? 1 : 0)
}

export function compareAnnotations(a: WorkspaceAnnotation[], b: WorkspaceAnnotation[]): Comparison[] {
  const left = [...a].sort(bySpan)
  const right = [...b].sort(bySpan)
  const usedLeft = new Set<number>()
  const usedRight = new Set<number>()
  const comparisons: Comparison[] = []

  const pair = (
    accepts: (x: WorkspaceAnnotation, y: WorkspaceAnnotation) => boolean,
    kind: (x: WorkspaceAnnotation, y: WorkspaceAnnotation) => ComparisonKind,
  ) => {
    left.forEach((x, i) => {
      if (usedLeft.has(i)) {
        return
      }

      let best = -1
      let bestOverlap = 0

      right.forEach((y, j) => {
        if (usedRight.has(j) || !accepts(x, y)) {
          return
        }

        const shared = overlapLength(x.start_index, x.end_index, y.start_index, y.end_index)

        if (best === -1 || shared > bestOverlap) {
          best = j
          bestOverlap = shared
        }
      })

      if (best === -1) {
        return
      }

      usedLeft.add(i)
      usedRight.add(best)
      comparisons.push({
        kind: kind(x, right[best]),
        a: x,
        b: right[best],
        start: Math.min(x.start_index, right[best].start_index),
      })
    })
  }

  pair(
    (x, y) => sameSpan(x, y) && x.entity === y.entity,
    (x, y) => (normaliseAttributes(x.attributes) === normaliseAttributes(y.attributes) ? "match" : "attributes"),
  )
  pair((x, y) => sameSpan(x, y), () => "entity")
  pair((x, y) => overlaps(x, y) && x.entity === y.entity, () => "boundary")
  pair((x, y) => overlaps(x, y), () => "entity")

  left.forEach((x, i) => {
    if (!usedLeft.has(i)) {
      comparisons.push({ kind: "only_a", a: x, b: null, start: x.start_index })
    }
  })

  right.forEach((y, j) => {
    if (!usedRight.has(j)) {
      comparisons.push({ kind: "only_b", a: null, b: y, start: y.start_index })
    }
  })

  return comparisons.sort((x, y) => x.start - y.start)
}

function spanScore(matched: number, countA: number, countB: number): SpanScore {
  return {
    matched,
    onlyA: countA - matched,
    onlyB: countB - matched,
    f1: countA + countB === 0 ? null : (2 * matched) / (countA + countB),
  }
}

interface SpanTally {
  countA: number
  countB: number
  exact: number
  overlap: number
}

function emptyTally(): SpanTally {
  return { countA: 0, countB: 0, exact: 0, overlap: 0 }
}

function tallyComparisons(comparisons: Comparison[], total: SpanTally, byEntity: Map<string, SpanTally>): void {
  const entityTally = (entity: string) => {
    const tally = byEntity.get(entity) ?? emptyTally()
    byEntity.set(entity, tally)
    return tally
  }

  comparisons.forEach(({ kind, a, b }) => {
    if (a) {
      total.countA++
      entityTally(a.entity).countA++
    }

    if (b) {
      total.countB++
      entityTally(b.entity).countB++
    }

    if (!a || !b || kind === "entity") {
      return
    }

    total.overlap++
    entityTally(a.entity).overlap++

    if (kind !== "boundary") {
      total.exact++
      entityTally(a.entity).exact++
    }
  })
}

export interface Token {
  start: number
  end: number
}

export function tokenise(content: string): Token[] {
  const tokens: Token[] = []

  for (const match of content.matchAll(/\S+/g)) {
    tokens.push({ start: match.index, end: match.index + match[0].length })
  }

  return tokens
}

export function tokenLabels(tokens: Token[], annotations: WorkspaceAnnotation[]): string[] {
  const sorted = [...annotations].sort(bySpan)

  return tokens.map((token) => {
    let label = OUTSIDE
    let bestOverlap = 0

    for (const annotation of sorted) {
      if (annotation.start_index >= token.end) {
        break
      }

      const shared = overlapLength(token.start, token.end, annotation.start_index, annotation.end_index)

      if (shared > bestOverlap) {
        label = annotation.entity
        bestOverlap = shared
      }
    }

    return label
  })
}

interface KappaTally {
  total: number
  agreed: number
  countsA: Map<string, number>
  countsB: Map<string, number>
}

function emptyKappaTally(): KappaTally {
  return { total: 0, agreed: 0, countsA: new Map(), countsB: new Map() }
}

function tallyKappa(tally: KappaTally, labelsA: string[], labelsB: string[]): void {
  labelsA.forEach((labelA, index) => {
    const labelB = labelsB[index]

    tally.total++
    tally.countsA.set(labelA, (tally.countsA.get(labelA) ?? 0) + 1)
    tally.countsB.set(labelB, (tally.countsB.get(labelB) ?? 0) + 1)

    if (labelA === labelB) {
      tally.agreed++
    }
  })
}

function kappa(tally: KappaTally): number | null {
  if (tally.total === 0) {
    return null
  }

  const observed = tally.agreed / tally.total
  let expected = 0

  tally.countsA.forEach((count, label) => {
    expected += (count / tally.total) * ((tally.countsB.get(label) ?? 0) / tally.total)
  })

  if (expected >= 1) {
    return null
  }

  return (observed - expected) / (1 - expected)
}

export function scorePair(
  documents: AgreementDocument[],
  grouped: AnnotationsByDocument,
  userA: string,
  userB: string,
): PairScore {
  const total = emptyTally()
  const byEntity = new Map<string, SpanTally>()
  const totalKappa = emptyKappaTally()
  const documentScores: DocumentScore[] = []

  documents.forEach((document) => {
    const byUser = grouped.get(document.id)
    const a = byUser?.get(userA)
    const b = byUser?.get(userB)

    if (!a || !b) {
      return
    }

    const documentTally = emptyTally()
    const documentKappa = emptyKappaTally()
    const tokens = tokenise(document.content)
    const labelsA = tokenLabels(tokens, a)
    const labelsB = tokenLabels(tokens, b)

    const comparisons = compareAnnotations(a, b)

    tallyComparisons(comparisons, documentTally, new Map())
    tallyComparisons(comparisons, total, byEntity)
    tallyKappa(documentKappa, labelsA, labelsB)
    tallyKappa(totalKappa, labelsA, labelsB)

    documentScores.push({
      documentId: document.id,
      countA: documentTally.countA,
      countB: documentTally.countB,
      exact: spanScore(documentTally.exact, documentTally.countA, documentTally.countB),
      overlap: spanScore(documentTally.overlap, documentTally.countA, documentTally.countB),
      kappa: kappa(documentKappa),
    })
  })

  return {
    userA,
    userB,
    documentCount: documentScores.length,
    tokenCount: totalKappa.total,
    exact: spanScore(total.exact, total.countA, total.countB),
    overlap: spanScore(total.overlap, total.countA, total.countB),
    kappa: kappa(totalKappa),
    entities: [...byEntity.entries()]
      .map(([entity, tally]) => ({
        entity,
        countA: tally.countA,
        countB: tally.countB,
        exact: spanScore(tally.exact, tally.countA, tally.countB),
        overlap: spanScore(tally.overlap, tally.countA, tally.countB),
      }))
      .sort((x, y) => (x.entity < y.entity ? -1 : x.entity > y.entity ? 1 : 0)),
    documents: documentScores,
  }
}

export function krippendorffAlpha(documents: AgreementDocument[], grouped: AnnotationsByDocument): AlphaScore {
  const labelTotals = new Map<string, number>()
  const annotators = new Set<string>()
  let pairable = 0
  let disagreement = 0
  let documentCount = 0
  let tokenCount = 0

  documents.forEach((document) => {
    const byUser = grouped.get(document.id)

    if (!byUser || byUser.size < 2) {
      return
    }

    const tokens = tokenise(document.content)
    const ratings = [...byUser.values()].map((annotations) => tokenLabels(tokens, annotations))
    const raters = ratings.length

    byUser.forEach((_, userId) => annotators.add(userId))
    documentCount++
    tokenCount += tokens.length

    tokens.forEach((_, index) => {
      const counts = new Map<string, number>()

      ratings.forEach((labels) => {
        counts.set(labels[index], (counts.get(labels[index]) ?? 0) + 1)
      })

      let squares = 0

      counts.forEach((count, label) => {
        squares += count * count
        labelTotals.set(label, (labelTotals.get(label) ?? 0) + count)
      })

      pairable += raters
      disagreement += (raters * raters - squares) / (raters - 1)
    })
  })

  const result = { documentCount, tokenCount, annotatorCount: annotators.size }

  if (pairable < 2) {
    return { alpha: null, ...result }
  }

  let totalSquares = 0

  labelTotals.forEach((count) => {
    totalSquares += count * count
  })

  const observed = disagreement / pairable
  const expected = (pairable * pairable - totalSquares) / (pairable * (pairable - 1))

  if (expected === 0) {
    return { alpha: null, ...result }
  }

  return { alpha: 1 - observed / expected, ...result }
}

export function scoreAllPairs(
  documents: AgreementDocument[],
  grouped: AnnotationsByDocument,
  userIds: string[],
): PairScore[] {
  const scores: PairScore[] = []

  userIds.forEach((userA, index) => {
    userIds.slice(index + 1).forEach((userB) => {
      const score = scorePair(documents, grouped, userA, userB)

      if (score.documentCount > 0) {
        scores.push(score)
      }
    })
  })

  return scores
}

export function interpretAgreement(value: number | null): string {
  if (value === null) {
    return "Not enough data"
  }

  if (value < 0) {
    return "Poor"
  }

  if (value <= 0.2) {
    return "Slight"
  }

  if (value <= 0.4) {
    return "Fair"
  }

  if (value <= 0.6) {
    return "Moderate"
  }

  if (value <= 0.8) {
    return "Substantial"
  }

  return "Almost perfect"
}
