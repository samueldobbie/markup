import { ActionIcon, Badge, Divider, Grid, Group, Modal, ScrollArea, Switch, Table, Text } from "@mantine/core"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { WorkspaceAnnotation } from "storage/database"
import { AgreementDocument, AnnotationsByDocument, compareAnnotations, Comparison, ComparisonKind } from "utils/Agreement"
import { colourForEntity } from "utils/EntityColour"

interface Props {
  documentIds: string[]
  documentId: string | null
  onDocumentChange: (documentId: string | null) => void
  documentNames: Map<string, string>
  contents: AgreementDocument[]
  grouped: AnnotationsByDocument
  userA: string
  userB: string
  nameA: string
  nameB: string
  entityColours: Record<string, string>
}

const DISAGREEMENT_COLOUR = "#e8590c"

const KIND_LABELS: Record<ComparisonKind, { label: string, colour: string }> = {
  match: { label: "Agree", colour: "green" },
  attributes: { label: "Attributes differ", colour: "yellow" },
  boundary: { label: "Span differs", colour: "orange" },
  entity: { label: "Entity differs", colour: "red" },
  only_a: { label: "Missing", colour: "grape" },
  only_b: { label: "Missing", colour: "grape" },
}

function ComparisonModal({
  documentIds,
  documentId,
  onDocumentChange,
  documentNames,
  contents,
  grouped,
  userA,
  userB,
  nameA,
  nameB,
  entityColours,
}: Props) {
  const [hideAgreements, setHideAgreements] = useState(true)

  const index = documentId === null ? -1 : documentIds.indexOf(documentId)
  const content = contents.find((document) => document.id === documentId)?.content ?? ""

  const annotationsA = useMemo(
    () => (documentId && grouped.get(documentId)?.get(userA)) || [],
    [documentId, grouped, userA],
  )
  const annotationsB = useMemo(
    () => (documentId && grouped.get(documentId)?.get(userB)) || [],
    [documentId, grouped, userB],
  )
  const comparisons = useMemo(() => compareAnnotations(annotationsA, annotationsB), [annotationsA, annotationsB])

  const disputed = new Set(
    comparisons
      .filter(({ kind }) => kind !== "match")
      .flatMap(({ a, b }) => [a?.id, b?.id])
      .filter((id): id is string => id !== undefined),
  )
  const disagreements = comparisons.filter(({ kind }) => kind !== "match")
  const rows = hideAgreements ? disagreements : comparisons
  const colourOf = (entity: string) => entityColours[entity] ?? colourForEntity(entity)

  return (
    <Modal
      size="90%"
      opened={index !== -1}
      onClose={() => onDocumentChange(null)}
      centered
      title={
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="brand"
            aria-label="Previous document"
            disabled={index <= 0}
            onClick={() => onDocumentChange(documentIds[index - 1])}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>

          <Text fw={600}>
            {documentId ? documentNames.get(documentId) : ""}
          </Text>

          <Text c="dimmed" fz={14}>
            {index + 1} / {documentIds.length}
          </Text>

          <ActionIcon
            variant="subtle"
            color="brand"
            aria-label="Next document"
            disabled={index >= documentIds.length - 1}
            onClick={() => onDocumentChange(documentIds[index + 1])}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
      }
    >
      <ScrollArea h={320} scrollbarSize={6} type="auto">
        <Grid gutter="xl">
          <Grid.Col span={6}>
            <AnnotatorColumn
              name={nameA}
              content={content}
              annotations={annotationsA}
              disputed={disputed}
              colourOf={colourOf}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <AnnotatorColumn
              name={nameB}
              content={content}
              annotations={annotationsB}
              disputed={disputed}
              colourOf={colourOf}
            />
          </Grid.Col>
        </Grid>
      </ScrollArea>

      <Divider my="md" />

      <Group justify="space-between" mb="sm">
        <Text fw={600}>
          {disagreements.length === 0
            ? "No disagreements"
            : `${disagreements.length} of ${comparisons.length} annotations disagree`}
        </Text>

        <Switch
          label="Hide agreements"
          checked={hideAgreements}
          onChange={(event) => setHideAgreements(event.currentTarget.checked)}
        />
      </Group>

      {rows.length > 0 && (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={170}>Result</Table.Th>
              <Table.Th>{nameA}</Table.Th>
              <Table.Th>{nameB}</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((comparison, row) => (
              <Table.Tr key={row}>
                <Table.Td>
                  <Badge variant="light" color={KIND_LABELS[comparison.kind].colour} radius="sm" tt="none">
                    {kindLabel(comparison, nameA, nameB)}
                  </Badge>
                </Table.Td>
                <ComparisonCell annotation={comparison.a} colourOf={colourOf} />
                <ComparisonCell annotation={comparison.b} colourOf={colourOf} />
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  )
}

function kindLabel(comparison: Comparison, nameA: string, nameB: string): string {
  if (comparison.kind === "only_a") {
    return `Only ${shortName(nameA)}`
  }

  if (comparison.kind === "only_b") {
    return `Only ${shortName(nameB)}`
  }

  return KIND_LABELS[comparison.kind].label
}

function shortName(name: string): string {
  return name.split("@")[0]
}

function formatAttributes(attributes: WorkspaceAnnotation["attributes"]): string {
  return Object.entries(attributes ?? {})
    .map(([name, value]) => `${name}: ${String(value)}`)
    .join(" · ")
}

function ComparisonCell({
  annotation,
  colourOf,
}: {
  annotation: WorkspaceAnnotation | null
  colourOf: (entity: string) => string
}) {
  if (!annotation) {
    return (
      <Table.Td>
        <Text c="dimmed" fz={14}>
          Not annotated
        </Text>
      </Table.Td>
    )
  }

  const attributes = formatAttributes(annotation.attributes)

  return (
    <Table.Td>
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <Badge color={colourOf(annotation.entity)} c="#333333" tt="none" radius="sm" style={{ flexShrink: 0 }}>
          {annotation.entity}
        </Badge>

        <div>
          <Text fz={14}>
            {annotation.text}
          </Text>

          {attributes && (
            <Text fz={12} c="dimmed">
              {attributes}
            </Text>
          )}
        </div>
      </Group>
    </Table.Td>
  )
}

interface Segment {
  text: string
  annotations: WorkspaceAnnotation[]
}

function buildSegments(content: string, annotations: WorkspaceAnnotation[]): Segment[] {
  const clamp = (value: number) => Math.max(0, Math.min(content.length, value))
  const boundaries = [...new Set([
    0,
    content.length,
    ...annotations.flatMap((annotation) => [clamp(annotation.start_index), clamp(annotation.end_index)]),
  ])].sort((a, b) => a - b)

  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1]

    return {
      text: content.slice(start, end),
      annotations: annotations.filter((annotation) => annotation.start_index < end && annotation.end_index > start),
    }
  })
}

function AnnotatorColumn({
  name,
  content,
  annotations,
  disputed,
  colourOf,
}: {
  name: string
  content: string
  annotations: WorkspaceAnnotation[]
  disputed: Set<string>
  colourOf: (entity: string) => string
}) {
  const segments = useMemo(() => buildSegments(content, annotations), [annotations, content])

  return (
    <>
      <Group justify="space-between" mb="xs">
        <Text fw={600} fz={14}>
          {name}
        </Text>

        <Text c="dimmed" fz={12}>
          {annotations.length} annotations
        </Text>
      </Group>

      <Text style={{ whiteSpace: "pre-line", lineHeight: 1.9 }}>
        {segments.map((segment, index) => {
          if (segment.annotations.length === 0) {
            return <span key={index}>{segment.text}</span>
          }

          const isDisputed = segment.annotations.some((annotation) => disputed.has(annotation.id))

          return (
            <span
              key={index}
              title={segment.annotations.map((annotation) => annotation.entity).join(", ")}
              style={{
                backgroundColor: colourOf(segment.annotations[0].entity),
                color: "#333333",
                padding: "2px 0",
                boxShadow: isDisputed ? `inset 0 -3px 0 ${DISAGREEMENT_COLOUR}` : undefined,
              }}
            >
              {segment.text}
            </span>
          )
        })}
      </Text>
    </>
  )
}

export default ComparisonModal
