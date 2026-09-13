import { Button, Card, Center, Collapse, Grid, Group, Loader, Text } from "@mantine/core"
import { IconCheck, IconRefresh, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Workspace, WorkspaceAnnotation, database } from "storage/database/Database"
import { useAnnotateStore } from "storage/state/Annotate"
import { ApiError } from "utils/Api"
import notify from "utils/Notifications"
import { logAnnotationFeedback, toFeedbackSpan } from "utils/AnnotationFeedback"
import { DocumentAnnotationSuggestion, suggestDocumentAnnotations } from "utils/Suggest"

interface Props {
  workspace: Workspace
  guideline: string
  guidelineReady: boolean
  setSuggestionCount: (count: number) => void
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

function spansOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA
}

function overlapsExisting(
  suggestion: DocumentAnnotationSuggestion,
  existing: WorkspaceAnnotation[],
): boolean {
  return existing.some((annotation) => (
    spansOverlap(
      suggestion.start_index,
      suggestion.end_index,
      annotation.start_index,
      annotation.end_index,
    )
  ))
}

function SmartAssistant({ workspace, guideline, guidelineReady, setSuggestionCount }: Props) {
  const config = useAnnotateStore((s) => s.config)
  const entityColours = useAnnotateStore((s) => s.entityColours)
  const documents = useAnnotateStore((s) => s.documents)
  const documentIndex = useAnnotateStore((s) => s.documentIndex)
  const annotations = useAnnotateStore((s) => s.annotations)
  const setAnnotations = useAnnotateStore((s) => s.setAnnotations)
  const pendingSuggestion = useAnnotateStore((s) => s.pendingSuggestion)
  const setPendingSuggestion = useAnnotateStore((s) => s.setPendingSuggestion)
  const setProposedAnnotation = useAnnotateStore((s) => s.setProposedAnnotation)

  const [suggestions, setSuggestions] = useState<DocumentAnnotationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [refreshToken, setRefreshToken] = useState(0)

  const document = documents[documentIndex]

  useEffect(() => {
    setSuggestionCount(suggestions.length)
  }, [setSuggestionCount, suggestions.length])

  useEffect(() => {
    const currentAnnotations = annotations[documentIndex] ?? []

    setSuggestions((current) => {
      const remaining = current.filter((suggestion) => (
        !overlapsExisting(suggestion, currentAnnotations)
      ))

      return remaining.length === current.length ? current : remaining
    })
  }, [annotations, documentIndex])

  useEffect(() => {
    if (!guidelineReady) {
      setLoading(true)
      setError("")
      return
    }

    if (!document || config.entities.length === 0) {
      setSuggestions([])
      setError("")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const currentAnnotations = useAnnotateStore.getState().annotations[documentIndex] ?? []

    setLoading(true)
    setError("")
    setSuggestions([])

    suggestDocumentAnnotations(
      workspace.id,
      {
        document: document.content,
        annotations: currentAnnotations.map((annotation) => ({
          entity: annotation.entity,
          text: annotation.text,
          start_index: annotation.start_index,
          end_index: annotation.end_index,
        })),
        config,
        guidelines: guideline || undefined,
      },
      controller.signal,
    )
      .then((data) => {
        const remaining = data.suggestions.filter((suggestion) => (
          !overlapsExisting(suggestion, currentAnnotations)
        ))

        setSuggestions(remaining)
      })
      .catch((caught) => {
        if (isAbortError(caught)) {
          return
        }

        setSuggestions([])

        if (caught instanceof ApiError && caught.status === 409) {
          setError("Configure AI on the workspace setup page to get suggestions.")
          return
        }

        setError(caught instanceof Error ? caught.message : "Failed to load suggestions.")
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [config, document, documentIndex, guideline, guidelineReady, refreshToken, workspace.id])

  const reviewSuggestion = (suggestion: DocumentAnnotationSuggestion) => {
    setPendingSuggestion(suggestion)
    setProposedAnnotation({
      tag: suggestion.entity,
      start: suggestion.start_index,
      end: suggestion.end_index,
      color: entityColours[suggestion.entity] || "#6F72E9",
    })
  }

  const dismissSuggestion = (suggestionId: string) => {
    const dismissed = suggestions.find((item) => item.id === suggestionId)

    if (pendingSuggestion?.id === suggestionId) {
      setPendingSuggestion(null)
      setProposedAnnotation(null)
    }

    setSuggestions((current) => current.filter((item) => item.id !== suggestionId))

    if (dismissed && document) {
      logAnnotationFeedback(workspace.id, document.id, [{
        action: "reject",
        suggestionId: dismissed.id,
        suggested: toFeedbackSpan(dismissed),
        accepted: null,
      }])
    }
  }

  const acceptAll = async () => {
    if (!document || suggestions.length === 0) {
      return
    }

    try {
      const saved = await Promise.all(suggestions.map((suggestion) => (
        database.addWorkspaceAnnotation(workspace.id, document.id, {
          text: suggestion.text,
          entity: suggestion.entity,
          start_index: suggestion.start_index,
          end_index: suggestion.end_index,
          attributes: suggestion.attributes,
        })
      )))

      const copy = [...annotations]
      copy[documentIndex] = [...(copy[documentIndex] ?? []), ...saved]
      setAnnotations(copy)
      setPendingSuggestion(null)
      setProposedAnnotation(null)
      setSuggestions([])

      logAnnotationFeedback(workspace.id, document.id, suggestions.map((suggestion, index) => ({
        action: "accept",
        suggestionId: suggestion.id,
        annotationId: saved[index].id,
        suggested: toFeedbackSpan(suggestion),
        accepted: toFeedbackSpan(suggestion),
      })))
    } catch (caught) {
      notify.error("Failed to add annotations.", caught instanceof Error ? caught : undefined)
    }
  }

  return (
    <Grid>
      <Grid.Col span={12}>
        <Group justify="space-between" wrap="nowrap">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={() => {
              if (pendingSuggestion) {
                setPendingSuggestion(null)
                setProposedAnnotation(null)
              }

              setRefreshToken((value) => value + 1)
            }}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconCheck size={14} />}
            onClick={() => acceptAll()}
            disabled={loading || suggestions.length === 0}
          >
            Accept all
          </Button>
        </Group>
      </Grid.Col>

      {loading && (
        <Grid.Col span={12}>
          <Center py="md">
            <Loader size="sm" />
          </Center>
        </Grid.Col>
      )}

      {!loading && error && (
        <Grid.Col span={12}>
          <Text c="dimmed" size="sm">
            {error}
          </Text>
        </Grid.Col>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <Grid.Col span={12}>
          <Text c="dimmed" size="sm">
            No suggestions for this document.
          </Text>
        </Grid.Col>
      )}

      {!loading && suggestions.map((suggestion) => {
        const selected = pendingSuggestion?.id === suggestion.id

        return (
          <Grid.Col span={12} key={suggestion.id}>
            <Card
              radius={2}
              p="sm"
              style={{
                backgroundColor: entityColours[suggestion.entity] || "#e9ecef",
                color: "#333333",
                cursor: "pointer",
                outline: selected ? "2px solid #1a1b1e" : undefined,
                outlineOffset: selected ? 2 : undefined,
              }}
              onClick={() => reviewSuggestion(suggestion)}
            >
              <Grid>
                <Grid.Col span={2}>
                  <IconX
                    size={16}
                    onClick={(event) => {
                      event.stopPropagation()
                      dismissSuggestion(suggestion.id)
                    }}
                  />
                </Grid.Col>

                <Grid.Col span={10} style={{ userSelect: "none" }}>
                  <Text fw={500} size="sm">
                    {suggestion.entity}
                  </Text>
                  <Text>
                    {suggestion.text}
                  </Text>
                  <Text c="dimmed" fz={12}>
                    {Object.keys(suggestion.attributes).length} attributes
                  </Text>
                </Grid.Col>
              </Grid>

              <Collapse in={selected && Object.keys(suggestion.attributes).length > 0} mt={10}>
                {Object.keys(suggestion.attributes).map((attribute) => (
                  <Text fz={12} key={attribute}>
                    {attribute}
                    <Text c="dimmed">
                      {suggestion.attributes[attribute]}
                    </Text>
                  </Text>
                ))}
              </Collapse>

              <Button
                fullWidth
                size="xs"
                mt={10}
                variant="white"
                color="dark"
                onClick={(event) => {
                  event.stopPropagation()
                  reviewSuggestion(suggestion)
                }}
              >
                Review
              </Button>
            </Card>
          </Grid.Col>
        )
      })}
    </Grid>
  )
}

export default SmartAssistant
