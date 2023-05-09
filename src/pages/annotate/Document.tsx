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
  const [availableDocuments, setAvailableDocuments] = useState<WorkspaceDocument[]>(documents)

  useEffect(() => {
    if (searchTerm === "") {
      setAvailableDocuments(documents)
    } else {
      const filteredDocuments = documents.filter(document => (
        document
          .content
          .toLocaleLowerCase()
          .includes(searchTerm)
      ))

      setAvailableDocuments(filteredDocuments)
    }
  }, [documents, searchTerm])

  return (
    <Modal
      size="xl"
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Document Finder"
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
          {availableDocuments.length === 0 && (
            <Grid.Col xs={12}>
              <Text color="dimmed">
                No matching documents found
              </Text>
            </Grid.Col>
          )}

          {availableDocuments.map((document, index) => {
            let documentSnippet = (
              <Text color="dimmed">
                {document.content.slice(0, 250)}
              </Text>
            )

            if (searchTerm !== "") {
              const documentContent = document.content.toLocaleLowerCase()
              const matchIndex = documentContent.search(searchTerm)

              const preMatchSnippet = document.content.slice(
                Math.max(matchIndex - 250, 0),
                matchIndex,
              )

              const searchTermSnippet = document.content.slice(
                matchIndex,
                matchIndex + searchTerm.length,
              )

              const postMatchSnippet = document.content.slice(
                matchIndex + searchTerm.length,
                Math.min(matchIndex + 250, document.content.length),
              )

              documentSnippet = (
                <Text color="dimmed">
                  {documentContent.search(searchTerm) > 0 && (
                    <Text>
                      {preMatchSnippet}

                      <span style={{ backgroundColor: "yellow" }}>
                        {searchTermSnippet}
                      </span>

                      {postMatchSnippet}
                    </Text>
                  )}
                </Text>
              )
            }

            return (
              <Grid.Col
                xs={12}
                key={index}
                onClick={() => {
                  setDocumentIndex(index)
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
