import { ActionIcon, Button, Card, Divider, Grid, Group, Modal, ScrollArea, Select, TextInput, Text } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconSearch } from "@tabler/icons"
import { database, RawAnnotation, WorkspaceAnnotation, WorkspaceDocument } from "storage/database/Database"
import { useEffect, useState } from "react"
import { SectionProps } from "./Interfaces"
import { TextAnnotateBlend } from "react-text-annotate-blend"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { activeEntityState, activeOntologyConceptsState, annotationsState, documentIndexState, documentsState, entityColoursState, populatedAttributeState } from "storage/state/Annotate"
import { useDebouncedState } from "@mantine/hooks"
import "./Document.css"

interface InlineAnnotation {
  tag: string
  start: number
  end: number
  color: string
}

function Document({ workspace }: SectionProps) {
  const activeEntity = useRecoilValue(activeEntityState)
  const entityColours = useRecoilValue(entityColoursState)
  const populatedAttributes = useRecoilValue(populatedAttributeState)
  const activeOntologyConcept = useRecoilValue(activeOntologyConceptsState)

  const [documents, setDocuments] = useRecoilState(documentsState)
  const [documentIndex, setDocumentIndex] = useRecoilState(documentIndexState)
  const [annotations, setAnnotations] = useRecoilState(annotationsState)
  const [openedSearchDocumentModal, setOpenedSearchDocumentModal] = useState(false)
  
  const moveToFirstDocument = () => setDocumentIndex(0)
  const moveToPreviousDocument = () => setDocumentIndex(documentIndex - 1)
  const moveToNextDocument = () => setDocumentIndex(documentIndex + 1)
  const moveToLastDocument = () => setDocumentIndex(documents.length - 1)

  const addAnnotation = (inlineAnnotation: InlineAnnotation) => {
    const { tag, start, end } = inlineAnnotation

    const documentId = documents[documentIndex].id
    const text = documents[documentIndex].content.slice(start, end)

    const allAttributes = {
      ...populatedAttributes,
    }

    if (activeOntologyConcept.name && activeOntologyConcept.code) {
      allAttributes["ontologyName"] = [activeOntologyConcept.name]
      allAttributes["ontologyCode"] = [activeOntologyConcept.code]
    }

    const rawAnnotation = {
      text,
      entity: tag,
      start_index: start,
      end_index: end,
      attributes: allAttributes,
    } as RawAnnotation

    database
      .addWorkspaceAnnotation(documentId, rawAnnotation)
      .then((annotation) => {
        const copy = [...annotations]
        copy[documentIndex] = [...copy[documentIndex], annotation]
        setAnnotations(copy)
      })
      .catch(() => console.error("Failed to add annotation. Please try again later."))
  }

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
      .catch(() => console.error("Failed to load documents. Please try again later."))
  }, [setDocuments, workspace.id])

  useEffect(() => {
    if (documents.length === 0) {
      return
    }

    database
      .getWorkspaceAnnotations(documents.map(i => i.id))
      .then(setAnnotations)
      .catch(() => console.error("Failed to load annotations. Please try again later."))
  }, [documents, setAnnotations])

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
                  value={annotations[documentIndex]?.map(annotation => {
                    const inlineAnnotation: InlineAnnotation = {
                      tag: "",
                      start: annotation.start_index,
                      end: annotation.end_index,
                      color: entityColours[annotation.entity],
                    }

                    return inlineAnnotation
                  })}
                  onChange={(updated) => {
                    if (
                      annotations[documentIndex].length >= updated.length ||
                      updated.length === 0
                    ) {
                      return
                    }

                    if (activeEntity === "") {
                      console.error("You need to select an entity")
                      return
                    }

                    addAnnotation(updated[updated.length - 1])
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

  const [availableDocuments, setAvailableDocuments] = useState<WorkspaceDocument[]>(documents)
  const [searchTerm, setSearchTerm] = useDebouncedState("", 200)

  useEffect(() => {
    if (searchTerm === "") {
      setAvailableDocuments(documents)
      return
    }

    const filteredDocuments = documents.filter(document => {
      return (
        document.name.toLocaleLowerCase().includes(searchTerm) ||
        document.content.toLocaleLowerCase().includes(searchTerm)
      )
    })
    setAvailableDocuments(filteredDocuments)
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
        onChange={(e) => {
          const searchTerm = e.currentTarget.value.toLocaleLowerCase()
          setSearchTerm(searchTerm)
        }}
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
            let content = (
              <Text color="dimmed">
                {document.content.slice(0, 250)}
              </Text>
            )

            if (searchTerm !== "") {
              const firstMatch = document.content.search(searchTerm)
              const before = document.content.slice(Math.max(firstMatch - 250, 0), firstMatch)
              const after = document.content.slice(firstMatch + searchTerm.length, Math.min(firstMatch + 250, document.content.length))

              content = (
                <Text color="dimmed">
                  {document.content.search(searchTerm) > 0 && (
                    <Text>
                      {before}

                      <span style={{ backgroundColor: "yellow" }}>
                        {searchTerm}
                      </span>

                      {after}
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

                  {content}
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
