import { useAnnotateStore } from "storage/state/Annotate"
import { ActionIcon, Button, Card, Center, Divider, Grid, Group, Loader, Modal, Pagination, ScrollArea, Select, TextInput, Text, Tooltip } from "@mantine/core"
import { IconArrowBackUp, IconArrowForwardUp, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconSearch } from "@tabler/icons-react"
import { database, WorkspaceDocument, WorkspaceDocumentName } from "storage/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Annotate"
import { TextAnnotateBlend } from "react-text-annotate-blend"
import { useDebouncedState } from "@mantine/hooks"
import notify from "utils/Notifications"
import { searchWorkspaceDocuments, DocumentSearchResult } from "utils/Search"
import { getWorkspaceModel } from "utils/WorkspaceModel"
import { redoAnnotationChange, undoAnnotationChange } from "utils/AnnotationHistory"
import "./Document.css"

const NAME_PAGE_SIZE = 50
const SEARCH_PAGE_SIZE = 10

export interface InlineAnnotation {
  tag: string
  start: number
  end: number
  color: string
}

function Document({ workspace }: SectionProps) {
  const activeEntity = useAnnotateStore((s) => s.activeEntity)
  const entityColours = useAnnotateStore((s) => s.entityColours)
  const proposedAnnotation = useAnnotateStore((s) => s.proposedAnnotation)
  const setProposedAnnotation = useAnnotateStore((s) => s.setProposedAnnotation)
  const setPendingSuggestion = useAnnotateStore((s) => s.setPendingSuggestion)

  const documentCount = useAnnotateStore((s) => s.documentCount)
  const setDocumentCount = useAnnotateStore((s) => s.setDocumentCount)
  const documentIndex = useAnnotateStore((s) => s.documentIndex)
  const setDocumentIndex = useAnnotateStore((s) => s.setDocumentIndex)
  const document = useAnnotateStore((s) => s.document)
  const setDocument = useAnnotateStore((s) => s.setDocument)
  const annotations = useAnnotateStore((s) => s.annotations)
  const canUndo = useAnnotateStore((s) => s.undoStack.length > 0)
  const canRedo = useAnnotateStore((s) => s.redoStack.length > 0)
  const resetAnnotationHistory = useAnnotateStore((s) => s.resetAnnotationHistory)
  const [openedSearchDocumentModal, setOpenedSearchDocumentModal] = useState(false)
  const [inlineAnnotations, setInlineAnnotations] = useState<InlineAnnotation[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [loadingDocument, setLoadingDocument] = useState(false)
  const [namePage, setNamePage] = useState<{ start: number, names: WorkspaceDocumentName[] }>({ start: 0, names: [] })

  const namePageStart = Math.floor(documentIndex / NAME_PAGE_SIZE) * NAME_PAGE_SIZE

  const moveToFirstDocument = () => setDocumentIndex(0)
  const moveToPreviousDocument = () => setDocumentIndex(documentIndex - 1)
  const moveToNextDocument = () => setDocumentIndex(documentIndex + 1)
  const moveToLastDocument = () => setDocumentIndex(documentCount - 1)

  useEffect(() => {
    let cancelled = false

    setLoadingDocuments(true)
    resetAnnotationHistory()
    setDocumentIndex(0)
    setDocument(null, [])

    database
      .getWorkspaceDocumentCount(workspace.id)
      .then((count) => {
        if (!cancelled) {
          setDocumentCount(count)
        }
      })
      .catch((e) => notify.error("Failed to load documents.", e))
      .finally(() => {
        if (!cancelled) {
          setLoadingDocuments(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [resetAnnotationHistory, setDocument, setDocumentCount, setDocumentIndex, workspace.id])

  useEffect(() => {
    if (loadingDocuments || documentCount === 0) {
      return
    }

    let cancelled = false

    setLoadingDocument(true)
    setDocument(null, [])

    database
      .getWorkspaceDocumentAt(workspace.id, documentIndex)
      .then(async (nextDocument) => {
        const nextAnnotations = nextDocument ? await database.getDocumentAnnotations(nextDocument.id) : []

        if (!cancelled) {
          setDocument(nextDocument, nextAnnotations)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          notify.error("Failed to load document.", e)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDocument(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [documentCount, documentIndex, loadingDocuments, setDocument, workspace.id])

  useEffect(() => {
    if (loadingDocuments || documentCount === 0) {
      return
    }

    let cancelled = false

    database
      .getWorkspaceDocumentNames(workspace.id, namePageStart, namePageStart + NAME_PAGE_SIZE - 1)
      .then((names) => {
        if (!cancelled) {
          setNamePage({ start: namePageStart, names })
        }
      })
      .catch((e) => notify.error("Failed to load document names.", e))

    return () => {
      cancelled = true
    }
  }, [documentCount, loadingDocuments, namePageStart, workspace.id])

  useEffect(() => {
    const inlineAnnotations = annotations.map(annotation => {
      const inlineAnnotation: InlineAnnotation = {
        tag: "",
        start: annotation.start_index,
        end: annotation.end_index,
        color: entityColours[annotation.entity],
      }

      return inlineAnnotation
    })

    if (proposedAnnotation) {
      inlineAnnotations.push({
        tag: "",
        start: proposedAnnotation.start,
        end: proposedAnnotation.end,
        color: "#6F72E9",
      })
    }

    setInlineAnnotations(inlineAnnotations)
  }, [annotations, entityColours, proposedAnnotation])

  useEffect(() => {
    setProposedAnnotation(null)
    setPendingSuggestion(null)
  }, [documentIndex, setProposedAnnotation, setPendingSuggestion])

  return (
    <>
      <Card shadow="xs" radius={5} p="xl">
        <ScrollArea scrollbarSize={0} style={{ height: "76vh" }}>
          {loadingDocuments && (
            <Center h="76vh">
              <Loader size="sm" />
            </Center>
          )}

          {!loadingDocuments && documentCount === 0 && (
            <Center h="76vh">
              <Text c="dimmed" size="sm">
                This workspace has no documents.
              </Text>
            </Center>
          )}

          {!loadingDocuments && documentCount > 0 && (
            <Grid>
              <Grid.Col span={12}>
                <Group gap={0} justify="center" wrap="nowrap">
                  <ActionIcon
                    className="document-nav-arrow"
                    size="lg"
                    color="brand"
                    variant="transparent"
                    onClick={moveToFirstDocument}
                    disabled={documentIndex <= 0}
                  >
                    <IconChevronsLeft size={16} />
                  </ActionIcon>

                  <ActionIcon
                    className="document-nav-arrow"
                    size="lg"
                    color="brand"
                    variant="transparent"
                    onClick={moveToPreviousDocument}
                    disabled={documentIndex <= 0}
                  >
                    <IconChevronLeft size={16} />
                  </ActionIcon>

                  <Select
                    size="md"
                    data={namePage.names.map((name, offset) => ({
                      value: String(namePage.start + offset),
                      label: name.name,
                    }))}
                    value={String(documentIndex)}
                    allowDeselect={false}
                    onChange={(value) => {
                      if (value !== null) {
                        setDocumentIndex(Number(value))
                      }
                    }}
                  />

                  <Text size="sm" c="dimmed" ml={10} mr={4} style={{ whiteSpace: "nowrap" }}>
                    {documentIndex + 1} / {documentCount}
                  </Text>

                  <ActionIcon
                    className="document-nav-arrow"
                    size="lg"
                    color="brand"
                    variant="transparent"
                    onClick={moveToNextDocument}
                    disabled={documentIndex >= documentCount - 1}
                  >
                    <IconChevronRight size={16} />
                  </ActionIcon>

                  <ActionIcon
                    className="document-nav-arrow"
                    size="lg"
                    color="brand"
                    variant="transparent"
                    onClick={moveToLastDocument}
                    disabled={documentIndex >= documentCount - 1}
                  >
                    <IconChevronsRight size={16} />
                  </ActionIcon>

                  <Divider orientation="vertical" ml={40} mr={40} />

                  <Button
                    variant="subtle"
                    color="brand"
                    leftSection={<IconSearch size={16} />}
                    onClick={() => setOpenedSearchDocumentModal(true)}
                  >
                    Search documents
                  </Button>

                  <Tooltip label="Undo (Ctrl/⌘+Z)">
                    <ActionIcon
                      size="lg"
                      color="brand"
                      variant="transparent"
                      onClick={() => undoAnnotationChange()}
                      disabled={!canUndo}
                      aria-label="Undo"
                    >
                      <IconArrowBackUp size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Redo (Ctrl/⌘+Shift+Z)">
                    <ActionIcon
                      size="lg"
                      color="brand"
                      variant="transparent"
                      onClick={() => redoAnnotationChange()}
                      disabled={!canRedo}
                      aria-label="Redo"
                    >
                      <IconArrowForwardUp size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider />
              </Grid.Col>

              <Grid.Col span={12}>
                {loadingDocument && (
                  <Center h="60vh">
                    <Loader size="sm" />
                  </Center>
                )}

                {!loadingDocument && !document && (
                  <Center h="60vh">
                    <Text c="dimmed" size="sm">
                      This document could not be found.
                    </Text>
                  </Center>
                )}

                {!loadingDocument && document && (
                  <TextAnnotateBlend
                    content={document.content}
                    value={inlineAnnotations}
                    onChange={(updated) => {
                      if (annotations.length >= updated.length || updated.length === 0) {
                        return
                      }

                      setPendingSuggestion(null)
                      setProposedAnnotation(updated[updated.length - 1])
                    }}
                    getSpan={(span) => ({
                      tag: activeEntity,
                      color: entityColours[activeEntity],
                      start: span.start,
                      end: span.end,
                    })}
                    style={{
                      fontSize: "1.1rem",
                      whiteSpace: "pre-line",
                    }}
                  />
                )}
              </Grid.Col>
            </Grid>
          )}
        </ScrollArea>
      </Card>

      <SearchDocumentModal
        workspaceId={workspace.id}
        documentCount={documentCount}
        openedModal={openedSearchDocumentModal}
        setOpenedModal={setOpenedSearchDocumentModal}
      />
    </>
  )
}

interface Props {
  workspaceId: string
  documentCount: number
  openedModal: boolean
  setOpenedModal: (openedModal: boolean) => void
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
    || error instanceof Error && error.name === "AbortError"
}

function SearchDocumentModal({ workspaceId, documentCount, openedModal, setOpenedModal }: Props) {
  const setDocumentIndex = useAnnotateStore((s) => s.setDocumentIndex)

  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useDebouncedState("", 500)
  const [modelConfigured, setModelConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DocumentSearchResult[] | null>(null)
  const [page, setPage] = useState(1)
  const [pageDocuments, setPageDocuments] = useState<WorkspaceDocument[]>([])
  const [loadingPage, setLoadingPage] = useState(false)

  useEffect(() => {
    if (!openedModal) {
      setPage(1)
      setInputValue("")
      setSearchTerm("")
      setResults(null)
      setLoading(false)
      return
    }

    getWorkspaceModel(workspaceId)
      .then((model) => setModelConfigured(model.configured))
      .catch(() => setModelConfigured(false))
  }, [openedModal, setSearchTerm, workspaceId])

  useEffect(() => {
    if (!openedModal) {
      return
    }

    if (searchTerm.trim() === "") {
      setLoading(false)
      setResults(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    searchWorkspaceDocuments(workspaceId, searchTerm, { signal: controller.signal })
      .then((response) => {
        setModelConfigured(response.modelConfigured)
        setResults(response.results)
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return
        }

        setResults([])
        notify.error("Failed to search documents.", error instanceof Error ? error : undefined)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [openedModal, searchTerm, workspaceId])

  useEffect(() => {
    if (!openedModal || documentCount === 0) {
      setPageDocuments([])
      return
    }

    let cancelled = false
    const from = (page - 1) * SEARCH_PAGE_SIZE

    setLoadingPage(true)

    database
      .getWorkspaceDocumentPage(workspaceId, from, from + SEARCH_PAGE_SIZE - 1)
      .then((documents) => {
        if (!cancelled) {
          setPageDocuments(documents)
        }
      })
      .catch((e) => notify.error("Failed to load documents.", e))
      .finally(() => {
        if (!cancelled) {
          setLoadingPage(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [documentCount, openedModal, page, workspaceId])

  const openDocument = (documentId: string) => {
    database
      .getWorkspaceDocumentIndex(workspaceId, documentId)
      .then((index) => {
        if (index < 0) {
          notify.error("This document could not be found.")
          return
        }

        setDocumentIndex(index)
        setOpenedModal(false)
      })
      .catch((e) => notify.error("Failed to open document.", e))
  }

  const pageCount = Math.ceil(documentCount / SEARCH_PAGE_SIZE)

  return (
    <Modal
      size="xl"
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title={
        <Group justify="flex-start" gap={5}>
          <IconSearch size={16} />

          <Text>
            Search documents
          </Text>
        </Group>
      }
      centered
    >
      <TextInput
        placeholder="female patients on metformin"
        size="md"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.currentTarget.value)
          setSearchTerm(e.currentTarget.value)
        }}
      />

      {!modelConfigured && (
        <Text size="sm" c="dimmed" mt={8}>
          Keyword search. Configure AI in workspace settings for conceptual search.
        </Text>
      )}

      <Divider mt={20} mb={20} />

      <ScrollArea scrollbarSize={0} style={{ height: 400 }}>
        <Grid>
          <SearchDocumentResults
            documents={pageDocuments}
            loadingMessage={loading ? "Searching documents…" : results === null && loadingPage ? "Loading documents…" : null}
            results={results}
            onOpen={openDocument}
          />
        </Grid>
      </ScrollArea>

      {results === null && pageCount > 1 && (
        <Group justify="center" mt={20}>
          <Pagination size="sm" color="brand" total={pageCount} value={page} onChange={setPage} />
        </Group>
      )}
    </Modal>
  )
}

function SearchDocumentResults({
  documents,
  loadingMessage,
  results,
  onOpen,
}: {
  documents: WorkspaceDocument[]
  loadingMessage: string | null
  results: DocumentSearchResult[] | null
  onOpen: (documentId: string) => void
}) {
  if (loadingMessage) {
    return (
      <Grid.Col span={12}>
        <Group justify="center" pt={40} pb={40}>
          <Loader size="sm" color="brand" />
          <Text c="dimmed">
            {loadingMessage}
          </Text>
        </Group>
      </Grid.Col>
    )
  }

  if (results !== null) {
    if (results.length === 0) {
      return (
        <Grid.Col span={12}>
          <Text c="dimmed">
            No matching documents found
          </Text>
        </Grid.Col>
      )
    }

    return (
      <>
        {results.map((result) => (
          <Grid.Col span={12} key={result.id} onClick={() => onOpen(result.id)}>
            <Card shadow="xs" radius={5} p="xl" style={{ cursor: "pointer" }}>
              {result.name}

              <Divider mt={10} mb={10} />

              <Text
                dangerouslySetInnerHTML={{ __html: result.snippet }}
                c="dimmed"
              />

              {result.reason && (
                <Text size="sm" mt={10}>
                  {result.reason}
                </Text>
              )}
            </Card>
          </Grid.Col>
        ))}
      </>
    )
  }

  if (documents.length === 0) {
    return (
      <Grid.Col span={12}>
        <Text c="dimmed">
          No matching documents found
        </Text>
      </Grid.Col>
    )
  }

  return (
    <>
      {documents.map((document) => (
        <Grid.Col span={12} key={document.id} onClick={() => onOpen(document.id)}>
          <Card shadow="xs" radius={5} p="xl" style={{ cursor: "pointer" }}>
            {document.name}

            <Divider mt={10} mb={10} />

            <Text c="dimmed">
              {document.content.slice(0, 250)}
            </Text>
          </Card>
        </Grid.Col>
      ))}
    </>
  )
}

export default Document
