import { ActionIcon, Card, Center, Collapse, Grid, Loader, Text } from "@mantine/core"
import { IconCheck, IconTrashX } from "@tabler/icons"
import { useEffect, useState } from "react"
import { useRecoilValue, useRecoilState } from "recoil"
import { RawAnnotation, database } from "storage/database"
import { entityColoursState, configState, documentsState, documentIndexState, annotationsState } from "storage/state"

interface SuggestedAnnotation {
  id: string
  entity: string
  start_index: number
  end_index: number
  attributes: any
  text: string
}

interface Props {
  workspaceId: string
  setSuggestionCount: (count: number) => void
}

const API_URL = "https://5dlyuegpikfzq4udamuui4mrli0amqih.lambda-url.eu-west-2.on.aws/"

function SmartAssistant({ workspaceId, setSuggestionCount }: Props) {
  const entityColours = useRecoilValue(entityColoursState)
  const config = useRecoilValue(configState)
  const documents = useRecoilValue(documentsState)
  const documentIndex = useRecoilValue(documentIndexState)
  const documentText = documents[documentIndex]?.content ?? ""

  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [suggestions, setSuggestions] = useState<SuggestedAnnotation[]>([])
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        licenseKey: "",
        config,
        document: documentText,
        annotations: annotations[documentIndex],
      })
    })
      .then((response) => response.json())
      .then((data) => {
        setSuggestions(data)
        setSuggestionCount(data.length)
      })
      .catch((e) => console.error(e))
  }, [annotations, config, documentIndex, documentText, setSuggestionCount])

  useEffect(() => {
    suggestions.forEach((suggestion) => {
      if (!Object.keys(openSuggestions).includes(suggestion.id)) {
        const copy = { ...openSuggestions }
        copy[suggestion.id] = false
        setOpenSuggestions(copy)
      }
    })
  }, [suggestions, openSuggestions])

  return (
    <Grid>
      <Grid.Col xs={12}>
        {loading && (
          <Grid mt={20}>
            <Grid.Col xs={12}>
              <Center>
                <Loader color="violet" variant="bars" />
              </Center>
            </Grid.Col>

            <Grid.Col xs={12}>
              <Center>
                <Text color="dimmed">
                  Generating suggestions...
                </Text>
              </Center>
            </Grid.Col>
          </Grid>
        )}

        {!loading && suggestions.length === 0 && (
          <Center>
            <Text color="dimmed">
              No suggestions
            </Text>
          </Center>
        )}

        {!loading && suggestions.length > 0 && (
          <Grid>
            {suggestions.map((suggestion, index) => (
              <Grid.Col xs={12} key={index}>
                <Card
                  radius={2}
                  p="sm"
                  sx={{
                    backgroundColor: entityColours[suggestion.entity],
                    color: "#333333",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    const copy = { ...openSuggestions }
                    copy[suggestion.id] = !copy[suggestion.id]
                    setOpenSuggestions(copy)
                  }}
                >
                  <Grid>
                    <Grid.Col xs={2}>
                      <ActionIcon color="green" variant="filled">
                        <IconCheck size={16} onClick={() => {
                            const { entity, text, start_index, end_index, attributes } = suggestion
                            const documentId = documents[documentIndex].id
                        
                            const rawAnnotation = {
                              text,
                              entity,
                              start_index,
                              end_index,
                              attributes,
                            } as RawAnnotation

                            database
                              .addWorkspaceAnnotation(workspaceId, documentId, rawAnnotation)
                              .then((annotation) => {
                                const copy = [...annotations]
                                copy[documentIndex] = [...copy[documentIndex], annotation]
                                setAnnotations(copy)
                              })
                              .catch(() => console.error("Failed to add annotation. Please try again later."))

                          setSuggestions(suggestions.filter(i => i.id !== suggestion.id))
                          setSuggestionCount(suggestions.length - 1)
                        }} />
                      </ActionIcon>

                      <ActionIcon color="red" variant="filled" mt={2}>
                        <IconTrashX size={16} onClick={() => {
                          setSuggestions(suggestions.filter(i => i.id !== suggestion.id))
                          setSuggestionCount(suggestions.length - 1)
                        }} />
                      </ActionIcon>
                    </Grid.Col>

                    <Grid.Col xs={10} sx={{ userSelect: "none" }}>
                      <Text>
                        {suggestion.text}
                      </Text>

                      <Text color="dimmed" size={12} sx={{ cursor: "pointer" }}>
                        {Object.keys(suggestion.attributes).length} attributes
                      </Text>
                    </Grid.Col>
                  </Grid>

                  <Collapse in={Object.keys(suggestion.attributes).length > 0 && openSuggestions[suggestion.id]} mt={10}>
                    {Object.keys(suggestion.attributes).map((attributeType, index) => (
                      <Text size={12} key={index}>
                        {attributeType}

                        <Text color="dimmed">
                          {suggestion.attributes[attributeType]}
                        </Text>
                      </Text>
                    ))}
                  </Collapse>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Grid.Col>
    </Grid>
  )
}

export default SmartAssistant
