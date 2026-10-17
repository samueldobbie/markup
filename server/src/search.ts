import { HTTPException } from "hono/http-exception"
import { compileAnnotationQuery } from "./annotationQuery.js"
import { completeJson } from "./complete.js"
import { getWorkspaceModelCredentials, getWorkspaceModelRow } from "./model.js"
import type { WorkspaceModelCredentials } from "./model.js"
import { searchExpandPrompt, searchJudgePrompt } from "./prompts.js"
import { supabaseAdmin } from "./supabase.js"
import {
  MAX_ANNOTATION_QUERY_LENGTH,
  MAX_SEARCH_QUERY_LENGTH,
  SEARCH_CANDIDATE_LIMIT,
  SEARCH_JUDGE_BATCH_SIZE,
  SEARCH_JUDGE_CONCURRENCY,
  SEARCH_JUDGE_DOC_CHARS,
} from "./types.js"

export type SearchMode = "conceptual" | "keyword" | "structured"

export interface MatchedAnnotation {
  id: string
  entity: string
  text: string
  start: number
  end: number
  attributes: Record<string, unknown>
}

export interface DocumentSearchResult {
  id: string
  name: string
  snippet: string
  reason: string | null
  matchCount?: number
  annotations?: MatchedAnnotation[]
}

export interface DocumentSearchResponse {
  mode: SearchMode
  modelConfigured: boolean
  modelFailed?: boolean
  results: DocumentSearchResult[]
}

interface SearchCandidate {
  id: string
  name: string
  content: string
  snippet: string
  rank: number
}

interface JudgeDecision {
  id: string
  match: boolean
  reason: string
  snippet: string
}

export async function searchWorkspaceDocuments(
  workspaceId: string,
  input: { query?: unknown, mode?: unknown },
  options: { allowConceptual: boolean },
): Promise<DocumentSearchResponse> {
  const requestedMode = parseMode(input.mode)

  if (requestedMode === "structured") {
    return {
      mode: "structured",
      modelConfigured: false,
      results: await searchAnnotations(workspaceId, parseQuery(input.query, MAX_ANNOTATION_QUERY_LENGTH)),
    }
  }

  const query = parseQuery(input.query, MAX_SEARCH_QUERY_LENGTH)
  const modelRow = options.allowConceptual ? await getWorkspaceModelRow(workspaceId) : null
  const modelConfigured = modelRow !== null
  const useConceptual = requestedMode === "conceptual" && modelConfigured

  if (!useConceptual) {
    return keywordSearch(workspaceId, query, modelConfigured, false)
  }

  const credentials = await getWorkspaceModelCredentials(workspaceId).catch((error: unknown) => {
    console.error("Workspace model credentials unavailable", error)
    return null
  })
  const expanded = credentials ? await expandQuery(credentials, query) : null

  if (!credentials || !expanded) {
    return keywordSearch(workspaceId, query, true, true)
  }

  const { keywords, criteria } = expanded
  const candidates = await retrieveCandidates(workspaceId, query, keywords)

  if (candidates.length === 0) {
    return {
      mode: "conceptual",
      modelConfigured: true,
      results: [],
    }
  }

  let matched: DocumentSearchResult[]

  try {
    matched = await judgeCandidates(credentials, criteria, keywords, candidates)
  } catch (error) {
    console.error("Conceptual search judging failed", error)
    return keywordSearch(workspaceId, query, true, true)
  }

  return {
    mode: "conceptual",
    modelConfigured: true,
    results: matched,
  }
}

async function keywordSearch(
  workspaceId: string,
  query: string,
  modelConfigured: boolean,
  modelFailed: boolean,
): Promise<DocumentSearchResponse> {
  const candidates = await retrieveCandidates(workspaceId, query, null)

  return {
    mode: "keyword",
    modelConfigured,
    ...(modelFailed ? { modelFailed } : {}),
    results: candidates.map((candidate) => toKeywordResult(candidate)),
  }
}

function parseQuery(value: unknown, maxLength: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HTTPException(400, { message: "query is required" })
  }

  const query = value.trim()

  if (query.length > maxLength) {
    throw new HTTPException(400, { message: "query is too long" })
  }

  return query
}

function parseMode(value: unknown): SearchMode {
  if (value === undefined || value === "conceptual") {
    return "conceptual"
  }

  if (value === "keyword" || value === "structured") {
    return value
  }

  throw new HTTPException(400, { message: "mode must be conceptual, keyword or structured" })
}

const MAX_ANNOTATIONS_PER_RESULT = 20

async function searchAnnotations(workspaceId: string, query: string): Promise<DocumentSearchResult[]> {
  const compiled = compileAnnotationQuery(query)

  const { data, error } = await supabaseAdmin.rpc("search_workspace_annotations", {
    p_workspace_id: workspaceId,
    p_all: compiled.all,
    p_none: compiled.none,
    p_limit: SEARCH_CANDIDATE_LIMIT,
  })

  if (error) {
    // Class 22 is data exceptions, e.g. an invalid $regex pattern.
    if (error.code?.startsWith("22")) {
      throw new HTTPException(400, { message: `Invalid query: ${error.message}` })
    }

    console.error("Annotation search failed", error)
    throw new HTTPException(500, { message: "Failed to search annotations" })
  }

  const rows = (data ?? []) as Array<{
    id: string
    name: string
    content: string
    match_count: number
    annotations: MatchedAnnotation[]
  }>

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    snippet: formatSnippet(annotationSnippet(row.content, row.annotations[0]), row.content),
    reason: null,
    matchCount: Number(row.match_count),
    annotations: row.annotations.slice(0, MAX_ANNOTATIONS_PER_RESULT),
  }))
}

function annotationSnippet(content: string, annotation: MatchedAnnotation | undefined): string {
  if (!annotation || annotation.start < 0 || annotation.end > content.length || annotation.start >= annotation.end) {
    return content.slice(0, 250)
  }

  const start = Math.max(0, annotation.start - 125)
  const end = Math.min(content.length, annotation.end + 125)
  const clean = (value: string) => value.replaceAll("[[", "[").replaceAll("]]", "]")

  return `${clean(content.slice(start, annotation.start))}[[${clean(content.slice(annotation.start, annotation.end))}]]${clean(content.slice(annotation.end, end))}`
}

async function expandQuery(
  credentials: WorkspaceModelCredentials,
  query: string,
): Promise<{ keywords: string[] | null, criteria: string } | null> {
  try {
    const parsed = await completeJson({
      ...credentials,
      prompt: searchExpandPrompt(query),
    }) as { keywords?: unknown, criteria?: unknown }

    const keywords = Array.isArray(parsed?.keywords)
      ? parsed.keywords
        .filter((item): item is string => typeof item === "string" && item.trim() !== "")
        .map((item) => item.trim().slice(0, 80))
        .filter((item) => item.length >= 2)
        .slice(0, 16)
      : []

    const criteria = typeof parsed?.criteria === "string" && parsed.criteria.trim() !== ""
      ? parsed.criteria.trim()
      : query

    return {
      keywords: keywords.length > 0 ? keywords : null,
      criteria,
    }
  } catch (error) {
    console.error("Search query expansion failed", error)
    return null
  }
}

async function retrieveCandidates(
  workspaceId: string,
  query: string,
  keywords: string[] | null,
): Promise<SearchCandidate[]> {
  const candidates = await runDocumentSearch(workspaceId, query, keywords)

  if (candidates.length > 0 || !keywords || keywords.length === 0) {
    return candidates
  }

  return runDocumentSearch(workspaceId, query, null)
}

async function runDocumentSearch(
  workspaceId: string,
  query: string,
  keywords: string[] | null,
): Promise<SearchCandidate[]> {
  const terms = retrievalTerms(query, keywords)

  if (terms.length === 0) {
    return []
  }

  const ftsQuery = terms.map(toWebsearchToken).filter((token) => token !== "").join(" OR ")

  if (ftsQuery !== "") {
    const fts = await supabaseAdmin
      .from("workspace_document")
      .select("id, name, content")
      .eq("workspace_id", workspaceId)
      .textSearch("content", ftsQuery, { type: "websearch", config: "english" })
      .limit(SEARCH_CANDIDATE_LIMIT)

    if (!fts.error) {
      const named = await searchDocumentsByName(workspaceId, terms)
      return mergeCandidates([...(fts.data ?? []), ...named], terms)
    }

    console.error("Document FTS search failed", fts.error)
  }

  return searchDocumentsByIlike(workspaceId, terms)
}

function retrievalTerms(query: string, keywords: string[] | null): string[] {
  const source = keywords && keywords.length > 0 ? keywords : [query]
  const unique = new Set<string>()

  for (const item of source) {
    const term = item.replace(/[,()]/g, " ").replace(/\s+/g, " ").trim()

    if (term.length >= 2) {
      unique.add(term)
    }
  }

  return [...unique].slice(0, 16)
}

function toWebsearchToken(term: string): string {
  const cleaned = term.replace(/[:"\\]/g, " ").replace(/\s+/g, " ").trim()

  if (cleaned.length < 2) {
    return ""
  }

  return /\s/.test(cleaned) ? `"${cleaned}"` : cleaned
}

function escapeIlike(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
}

async function searchDocumentsByName(workspaceId: string, terms: string[]): Promise<SearchCandidate[]> {
  const filter = terms
    .map((term) => `name.ilike.%${escapeIlike(term)}%`)
    .join(",")

  const { data, error } = await supabaseAdmin
    .from("workspace_document")
    .select("id, name, content")
    .eq("workspace_id", workspaceId)
    .or(filter)
    .limit(SEARCH_CANDIDATE_LIMIT)

  if (error) {
    console.error("Document name search failed", error)
    return []
  }

  return mergeCandidates(data ?? [], terms)
}

async function searchDocumentsByIlike(workspaceId: string, terms: string[]): Promise<SearchCandidate[]> {
  const filter = terms
    .flatMap((term) => {
      const pattern = escapeIlike(term)
      return [`name.ilike.%${pattern}%`, `content.ilike.%${pattern}%`]
    })
    .join(",")

  const { data, error } = await supabaseAdmin
    .from("workspace_document")
    .select("id, name, content")
    .eq("workspace_id", workspaceId)
    .or(filter)
    .limit(SEARCH_CANDIDATE_LIMIT)

  if (error) {
    console.error("Document search failed", error)
    throw new HTTPException(500, { message: "Failed to search documents" })
  }

  return mergeCandidates(data ?? [], terms)
}

function mergeCandidates(
  rows: Array<{ id?: unknown, name?: unknown, content?: unknown }>,
  terms: string[],
): SearchCandidate[] {
  const candidates = new Map<string, SearchCandidate>()

  for (const row of rows) {
    const candidate = parseCandidate(row, terms)

    if (candidate && !candidates.has(candidate.id)) {
      candidates.set(candidate.id, candidate)
    }
  }

  return [...candidates.values()].slice(0, SEARCH_CANDIDATE_LIMIT)
}

function parseCandidate(row: unknown, terms: string[] = []): SearchCandidate | null {
  if (!row || typeof row !== "object") {
    return null
  }

  const candidate = row as Record<string, unknown>

  if (
    typeof candidate.id !== "string"
    || typeof candidate.name !== "string"
    || typeof candidate.content !== "string"
  ) {
    return null
  }

  return {
    id: candidate.id,
    name: candidate.name,
    content: candidate.content,
    snippet: typeof candidate.snippet === "string" && candidate.snippet.trim() !== ""
      ? candidate.snippet
      : snippetFromContent(candidate.content, terms),
    rank: typeof candidate.rank === "number" ? candidate.rank : 0,
  }
}

function snippetFromContent(content: string, terms: string[]): string {
  const lower = content.toLowerCase()
  let matchIndex = -1
  let matchLength = 0

  for (const term of terms) {
    const index = lower.indexOf(term.toLowerCase())

    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index
      matchLength = term.length
    }
  }

  if (matchIndex === -1) {
    return content.slice(0, 250)
  }

  const start = Math.max(0, matchIndex - 125)
  const end = Math.min(content.length, matchIndex + matchLength + 125)
  const slice = content.slice(start, end)
  const localIndex = matchIndex - start

  return `${slice.slice(0, localIndex)}[[${slice.slice(localIndex, localIndex + matchLength)}]]${slice.slice(localIndex + matchLength)}`
}

async function judgeCandidates(
  credentials: WorkspaceModelCredentials,
  criteria: string,
  keywords: string[] | null,
  candidates: SearchCandidate[],
): Promise<DocumentSearchResult[]> {
  const batches: SearchCandidate[][] = []

  for (let index = 0; index < candidates.length; index += SEARCH_JUDGE_BATCH_SIZE) {
    batches.push(candidates.slice(index, index + SEARCH_JUDGE_BATCH_SIZE))
  }

  const decisions = new Map<string, JudgeDecision>()

  for (let index = 0; index < batches.length; index += SEARCH_JUDGE_CONCURRENCY) {
    const chunk = batches.slice(index, index + SEARCH_JUDGE_CONCURRENCY)
    const judged = await Promise.all(
      chunk.map((batch) => judgeBatch(credentials, criteria, keywords, batch)),
    )

    for (const decision of judged.flat()) {
      decisions.set(decision.id, decision)
    }
  }

  return candidates.flatMap((candidate) => {
    const decision = decisions.get(candidate.id)

    if (!decision?.match) {
      return []
    }

    return [{
      id: candidate.id,
      name: candidate.name,
      snippet: formatSnippet(
        decision.snippet.trim() !== "" ? wrapQuoteAsHeadline(decision.snippet) : candidate.snippet,
        candidate.content,
      ),
      reason: decision.reason.trim() || null,
    }]
  })
}

async function judgeBatch(
  credentials: WorkspaceModelCredentials,
  criteria: string,
  keywords: string[] | null,
  batch: SearchCandidate[],
): Promise<JudgeDecision[]> {
  const parsed = await completeJson({
    ...credentials,
    prompt: searchJudgePrompt(
      criteria,
      batch.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        text: truncateForJudge(candidate.content, keywords),
      })),
    ),
    timeoutMs: 90_000,
  }) as { results?: unknown }

  const knownIds = new Set(batch.map((candidate) => candidate.id))
  const rows = Array.isArray(parsed?.results) ? parsed.results : []

  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return []
    }

    const decision = row as Record<string, unknown>

    if (typeof decision.id !== "string" || !knownIds.has(decision.id)) {
      return []
    }

    return [{
      id: decision.id,
      match: decision.match === true,
      reason: typeof decision.reason === "string" ? decision.reason : "",
      snippet: typeof decision.snippet === "string" ? decision.snippet : "",
    }]
  })
}

function truncateForJudge(content: string, keywords: string[] | null): string {
  if (content.length <= SEARCH_JUDGE_DOC_CHARS) {
    return content
  }

  const headChars = Math.floor(SEARCH_JUDGE_DOC_CHARS * 0.4)
  const windowChars = SEARCH_JUDGE_DOC_CHARS - headChars - 5
  const head = content.slice(0, headChars)
  const lower = content.toLowerCase()
  const terms = (keywords ?? []).map((keyword) => keyword.toLowerCase()).filter((keyword) => keyword.length >= 2)

  for (const term of terms) {
    const index = lower.indexOf(term)

    if (index === -1) {
      continue
    }

    const start = Math.max(0, index - Math.floor(windowChars / 4))
    return `${head}\n…\n${content.slice(start, start + windowChars)}`
  }

  return content.slice(0, SEARCH_JUDGE_DOC_CHARS)
}

function toKeywordResult(candidate: SearchCandidate): DocumentSearchResult {
  return {
    id: candidate.id,
    name: candidate.name,
    snippet: formatSnippet(candidate.snippet, candidate.content),
    reason: null,
  }
}

function wrapQuoteAsHeadline(quote: string): string {
  const cleaned = quote.replaceAll("[", "").replaceAll("]", "").slice(0, 280)
  return `[[${cleaned}]]`
}

function formatSnippet(headline: string, fallback: string): string {
  const source = headline.trim() !== "" ? headline : fallback.slice(0, 250)
  return escapeHtml(source)
    .replaceAll("[[", '<span style="background-color: #FDE047">')
    .replaceAll("]]", "</span>")
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
}
