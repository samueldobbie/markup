import { Button, Card, Center, Collapse, Grid, Group, Loader, Text } from "@mantine/core"
import { IconCheck, IconRefresh, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Workspace, database } from "storage/database/Database"
import { useAnnotateStore } from "storage/state/Annotate"
import { ApiError } from "utils/Api"
import notify from "utils/Notifications"
import { DocumentAnnotationSuggestion, suggestDocumentAnnotations } from "utils/Suggest"

interface Props {
  workspace: Workspace
  guideline: string
  setSuggestionCount: (count: number) => void
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

function SmartAssistant({ workspace, guideline, setSuggestionCount }: Props) {
  const config = useAnnotateStore((s) => s.config)
  const entityColours = useAnnotateStore((s) => s.entityColours)
  const documents = useAnnotateStore((s) => s.documents)
  const documentIndex = useAnnotateStore((s) => s.documentIndex)
  const annotations = useAnnotateStore((s) => s.annotations)
  const setAnnotations = useAnnotateStore((s) => s.setAnnotations)

  const [suggestions, setSuggestions] = useState<DocumentAnnotationSuggestion[]>([])
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [refreshToken, setRefreshToken] = useState(0)

  const document = documents[documentIndex]

  useEffect(() => {
    if (!document || config.entities.length === 0) {
      setSuggestions([])
      setError("")
      setSuggestionCount(0)
      return
    }

    const controller = new AbortController()
    const currentAnnotations = useAnnotateStore.getState().annotations[documentIndex] ?? []

    setLoading(true)
    setError("")

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
        setSuggestions(data.suggestions)
        setSuggestionCount(data.suggestions.length)
      })
      .catch((caught) => {
        if (isAbortError(caught)) {
          return
        }

        setSuggestions([])
        setSuggestionCount(0)

        if (caught instanceof ApiError && caught.status === 409) {
          setError("Configure a model in workspace Settings to get suggestions.")
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
  }, [config, document, documentIndex, guideline, refreshToken, setSuggestionCount, workspace.id])

  const acceptSuggestion = async (suggestion: DocumentAnnotationSuggestion) => {
    if (!document) {
      return
    }

    try {
      const annotation = await database.addWorkspaceAnnotation(workspace.id, document.id, {
        text: suggestion.text,
        entity: suggestion.entity,
        start_index: suggestion.start_index,
        end_index: suggestion.end_index,
        attributes: suggestion.attributes,
      })

      const copy = [...annotations]
      copy[documentIndex] = [...(copy[documentIndex] ?? []), annotation]
      setAnnotations(copy)

      const remaining = suggestions.filter((item) => item.id !== suggestion.id)
      setSuggestions(remaining)
      setSuggestionCount(remaining.length)
    } catch (caught) {
      notify.error("Failed to add annotation.", caught instanceof Error ? caught : undefined)
    }
  }

  const dismissSuggestion = (suggestionId: string) => {
    const remaining = suggestions.filter((item) => item.id !== suggestionId)
    setSuggestions(remaining)
    setSuggestionCount(remaining.length)
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
      setSuggestions([])
      setSuggestionCount(0)
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
            onClick={() => setRefreshToken((value) => value + 1)}
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

      {!loading && suggestions.map((suggestion) => (
        <Grid.Col span={12} key={suggestion.id}>
          <Card
            radius={2}
            p="sm"
            style={{
              backgroundColor: entityColours[suggestion.entity] || "#e9ecef",
              color: "#333333",
              cursor: "pointer",
            }}
            onClick={() => {
              setOpenSuggestions({
                ...openSuggestions,
                [suggestion.id]: !openSuggestions[suggestion.id],
              })
            }}
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

            <Collapse in={Object.keys(suggestion.attributes).length > 0 && openSuggestions[suggestion.id]} mt={10}>
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
                acceptSuggestion(suggestion)
              }}
            >
              Accept
            </Button>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  )
}

export default SmartAssistant
