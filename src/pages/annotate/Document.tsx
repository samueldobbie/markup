import { ActionIcon, Button, Card, Divider, Grid, Group, Modal, ScrollArea, Select, TextInput, Text } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconSearch } from "@tabler/icons"
import { database, WorkspaceAnnotation, WorkspaceDocument } from "storage/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Annotate"
import { TextAnnotateBlend } from "react-text-annotate-blend"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { activeEntityState, annotationsState, documentIndexState, documentsState, entityColoursState, proposedAnnotationState } from "storage/state/Annotate"
import { useDebouncedState } from "@mantine/hooks"
import notify from "utils/Notifications"
import "./Document.css"
import uuid from "react-uuid"

export interface InlineAnnotation {
  tag: string
  start: number
  end: number
  color: string
}

function Document({ workspace }: SectionProps) {
  const activeEntity = useRecoilValue(activeEntityState)
  const entityColours = useRecoilValue(entityColoursState)
  const [proposedAnnotation, setProposedAnnotation] = useRecoilState(proposedAnnotationState)

  const [documents, setDocuments] = useRecoilState(documentsState)
  const [documentIndex, setDocumentIndex] = useRecoilState(documentIndexState)
  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [openedSearchDocumentModal, setOpenedSearchDocumentModal] = useState(false)
  const [inlineAnnotations, setInlineAnnotations] = useState<InlineAnnotation[]>([])

  const moveToFirstDocument = () => setDocumentIndex(0)
  const moveToPreviousDocument = () => setDocumentIndex(documentIndex - 1)
  const moveToNextDocument = () => setDocumentIndex(documentIndex + 1)
  const moveToLastDocument = () => setDocumentIndex(documents.length - 1)

  useEffect(() => {
    const newAnnotations: WorkspaceAnnotation[][] = []
    let documentSize = documents.length

    while (documentSize > 0) {
      newAnnotations.push([])
      documentSize--
    }

    setAnnotations(newAnnotations)
  }, [documents.length, setAnnotations])

  useEffect(() => {
    database
      .getWorkspaceDocuments(workspace.id)
      .then(setDocuments)
      .catch((e) => notify.error("Failed to load documents.", e))
  }, [setDocuments, workspace.id])

  useEffect(() => {
    if (documents.length === 0) {
      return
    }

    database
      .getWorkspaceAnnotations(documents.map(i => i.id))
      .then(setAnnotations)
      .catch((e) => notify.error("Failed to load annotations.", e))
  }, [documents, setAnnotations])

  useEffect(() => {
    const inlineAnnotations = annotations[documentIndex]?.map(annotation => {
      const inlineAnnotation: InlineAnnotation = {
        tag: "",
        start: annotation.start_index,
        end: annotation.end_index,
        color: entityColours[annotation.entity],
      }

      return inlineAnnotation
    })

    if (proposedAnnotation) {
      inlineAnnotations?.push({
        tag: "",
        start: proposedAnnotation.start,
        end: proposedAnnotation.end,
        color: "#6F72E9",
      })
    }

    setInlineAnnotations(inlineAnnotations || [])
  }, [annotations, documentIndex, entityColours, proposedAnnotation])

  return (
    <>
      {documents.length > 0 &&
        <Card shadow="xs" radius={5} p="xl">
          <ScrollArea scrollbarSize={0} sx={{ height: "76vh" }}>
            <Grid>
              <Grid.Col xs={12}>
                <Group spacing={0} position="center" noWrap>
                  <ActionIcon
                    size="lg"
                    color="x"
                    variant="transparent"
                    onClick={moveToFirstDocument}
                    disabled={documentIndex <= 0}
                  >
                    <IconChevronsLeft size={16} />
                  </ActionIcon>

                  <ActionIcon
                    size="lg"
                    color="x"
                    variant="transparent"
                    onClick={moveToPreviousDocument}
                    disabled={documentIndex <= 0}
                  >
                    <IconChevronLeft size={16} />
                  </ActionIcon>

                  <Select
                    size="md"
                    data={documents.map(i => i.name)}
                    value={documents[documentIndex].name}
                    onChange={(nextDocumentName) => {
                      documents.forEach((document, index) => {
                        if (document.name === nextDocumentName) {
                          setDocumentIndex(index)
                          return
                        }
                      })
                    }}
                  />

                  <ActionIcon
                    size="lg"
                    color="x"
                    variant="transparent"
                    onClick={moveToNextDocument}
                    disabled={documentIndex >= documents.length - 1}
                  >
                    <IconChevronRight size={16} />
                  </ActionIcon>

                  <ActionIcon
                    size="lg"
                    color="x"
                    variant="transparent"
                    onClick={moveToLastDocument}
                    disabled={documentIndex >= documents.length - 1}
                  >
                    <IconChevronsRight size={16} />
                  </ActionIcon>

                  <Divider orientation="vertical" ml={40} mr={40} />

                  <Button
                    variant="subtle"
                    leftIcon={<IconSearch size={16} />}
                    onClick={() => setOpenedSearchDocumentModal(true)}
                  >
                    Search documents
                  </Button>
                </Group>
              </Grid.Col>

              <Grid.Col xs={12}>
                <Divider />
              </Grid.Col>

              <Grid.Col xs={12}>
                <TextAnnotateBlend
                  content={documents[documentIndex].content}
                  value={inlineAnnotations}
                  onChange={(updated) => {
                    if (annotations[documentIndex].length >= updated.length || updated.length === 0) {
                      return
                    }

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
              </Grid.Col>
            </Grid>
          </ScrollArea>
        </Card>
      }

      <SearchDocumentModal
        documents={documents}
        openedModal={openedSearchDocumentModal}
        setOpenedModal={setOpenedSearchDocumentModal}
      />
    </>
  )
}

interface Props {
  documents: WorkspaceDocument[]
  openedModal: boolean
  setOpenedModal: (openedModal: boolean) => void
}

function SearchDocumentModal({ documents, openedModal, setOpenedModal }: Props) {
  const setDocumentIndex = useSetRecoilState(documentIndexState)

  const [searchTerm, setSearchTerm] = useDebouncedState("", 200)
  const [availableDocuments, setAvailableDocuments] = useState<Record<number, WorkspaceDocument>>({})

  useEffect(() => {
    if (searchTerm === "") {
      const availableDocuments: Record<number, WorkspaceDocument> = {}

      documents.forEach((document, index) => {
        availableDocuments[index] = document
      })

      setAvailableDocuments(availableDocuments)
    } else {
      const availableDocuments: Record<number, WorkspaceDocument> = {}

      documents.forEach((document, index) => {
        const isMatch = document
          .content
          .toLocaleLowerCase()
          .includes(searchTerm)

        if (isMatch) {
          availableDocuments[index] = document
        }
      })

      setAvailableDocuments(availableDocuments)
    }
  }, [documents, searchTerm])

  return (
    <Modal
      size="xl"
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title={
        <Group position="left" spacing={5}>
          <IconSearch size={16} />

          <Text>
            Search documents
          </Text>
        </Group>
      }
      centered
    >
      <TextInput
        placeholder="Enter search term"
        size="md"
        onChange={(e) => setSearchTerm(e.currentTarget.value.toLocaleLowerCase())}
      />

      <Divider mt={20} mb={20} />

      <ScrollArea scrollbarSize={0} sx={{ height: 400 }}>
        <Grid>
          {Object.keys(availableDocuments).length === 0 && (
            <Grid.Col xs={12}>
              <Text color="dimmed">
                No matching documents found
              </Text>
            </Grid.Col>
          )}

          {Object.keys(availableDocuments).map((documentIndex) => {
            const parsedDocumentIndex = parseInt(documentIndex)
            const document = availableDocuments[parsedDocumentIndex]

            let documentSnippet = (
              <Text color="dimmed">
                {document.content.slice(0, 250)}
              </Text>
            )

            if (searchTerm !== "") {
              // highlight search term (case insensitive) in yellow
              const searchTermRegex = new RegExp(searchTerm, "gi")
              const highlightedContent = document.content.replace(searchTermRegex, (match) => (
                `<span style="background-color: #FDE047">${match}</span>`
              ))

              // show up to 125 characters before and after the search term
              const searchTermIndex = highlightedContent.indexOf(`<span style="background-color: #FDE047">`)
              let snippetStartIndex = Math.max(0, searchTermIndex - 125)
              let snippetEndIndex = Math.min(highlightedContent.length, searchTermIndex + 125)

              // if the search term is at the start or end of the document, show more characters
              if (snippetStartIndex === 0) {
                snippetEndIndex = Math.min(highlightedContent.length, snippetEndIndex + 125)
              } else if (snippetEndIndex === highlightedContent.length) {
                snippetStartIndex = Math.max(0, snippetStartIndex - 125)
              }

              documentSnippet = (
                <Text
                  dangerouslySetInnerHTML={{ __html: highlightedContent.slice(snippetStartIndex, snippetEndIndex) }}
                  color="dimmed"
                />
              )
            }

            return (
              <Grid.Col
                xs={12}
                key={uuid()}
                onClick={() => {
                  setDocumentIndex(parsedDocumentIndex)
                  setOpenedModal(false)
                }}
              >
                <Card shadow="xs" radius={5} p="xl">
                  {document.name}

                  <Divider mt={10} mb={10} />

                  {documentSnippet}
                </Card>
              </Grid.Col>
            )
          })}
        </Grid>
      </ScrollArea>
    </Modal>
  )
}

export default Document
