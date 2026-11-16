import { Alert, Badge, Button, Card, Center, Container, Grid, Group, Loader, Select, Switch, Table, Text, Tooltip } from "@mantine/core"
import { IconArrowLeft, IconEyeOff, IconInfoCircle } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import InvalidWorkspace from "pages/error/InvalidWorkspace"
import { parseJsonConfig } from "pages/annotate/ParseJsonConfig"
import { database, Workspace, WorkspaceAnnotation, WorkspaceAnnotator, WorkspaceDocumentName } from "storage/database"
import {
  AgreementDocument,
  groupAnnotations,
  interpretAgreement,
  krippendorffAlpha,
  PairScore,
  scoreAllPairs,
  sharedDocumentIds,
} from "utils/Agreement"
import { coloursForEntities } from "utils/EntityColour"
import { moveToPage } from "utils/Location"
import notify from "utils/Notifications"
import { toSetupUrl } from "utils/Path"
import ComparisonModal from "./ComparisonModal"

interface AgreementData {
  documents: WorkspaceDocumentName[]
  annotations: WorkspaceAnnotation[]
  annotators: WorkspaceAnnotator[]
  contents: AgreementDocument[]
  entityColours: Record<string, string>
}

const METRIC_HELP = {
  alpha: "Krippendorff's alpha across every annotator, measured per word. 1 is perfect agreement, 0 is what chance would produce.",
  exact: "Share of annotations where both annotators chose the same entity and exactly the same span of text.",
  relaxed: "Share of annotations where both annotators chose the same entity and their spans overlap.",
  kappa: "Cohen's kappa per word, which corrects for the agreement two annotators would reach by chance.",
}

function formatScore(value: number | null): string {
  return value === null ? "–" : value.toFixed(2)
}

function scoreColour(value: number | null): string {
  if (value === null) {
    return "gray"
  }

  if (value > 0.8) {
    return "green"
  }

  if (value > 0.6) {
    return "teal"
  }

  if (value > 0.4) {
    return "yellow"
  }

  return "red"
}

function pairKey(score: PairScore): string {
  return `${score.userA}:${score.userB}`
}

async function loadAgreementData(workspaceId: string): Promise<AgreementData> {
  const [{ documents, annotations: annotationGroups }, annotators, config] = await Promise.all([
    database.getWorkspaceExport(workspaceId),
    database.getWorkspaceAnnotators(workspaceId),
    database.getWorkspaceConfig(workspaceId),
  ])

  const annotations = annotationGroups.flat()
  const contents = await database.getWorkspaceDocumentContents(
    workspaceId,
    sharedDocumentIds(groupAnnotations(annotations)),
  )
  const entities = config ? parseJsonConfig(config.content).entities.map((entity) => entity.name) : []

  return {
    documents,
    annotations,
    annotators,
    contents,
    entityColours: coloursForEntities([...entities, ...annotations.map((annotation) => annotation.entity)]),
  }
}

function Agreement() {
  const { id } = useParams()

  const [invalidWorkspace, setInvalidWorkspace] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace>()
  const [data, setData] = useState<AgreementData>()
  const [isOwner, setIsOwner] = useState(false)
  const [savingBlind, setSavingBlind] = useState(false)
  const [selectedPair, setSelectedPair] = useState<string | null>(null)
  const [openedDocumentId, setOpenedDocumentId] = useState<string | null>(null)

  useEffect(() => {
    if (id === undefined) {
      setInvalidWorkspace(true)
      return
    }

    Promise.all([database.getWorkspace(id), database.isWorkspaceOwner(id)])
      .then(([workspaces, owner]) => {
        if (workspaces.length === 0) {
          setInvalidWorkspace(true)
          return
        }

        setIsOwner(owner)
        setWorkspace(workspaces[0])

        if (workspaces[0].blind_annotation && !owner) {
          return
        }

        return loadAgreementData(id).then(setData)
      })
      .catch((e) => notify.error("Failed to load annotator agreement.", e))
  }, [id])

  const grouped = useMemo(() => groupAnnotations(data?.annotations ?? []), [data])

  const orderedContents = useMemo(() => {
    const contents = new Map((data?.contents ?? []).map((document) => [document.id, document]))

    return (data?.documents ?? []).flatMap((document) => {
      const content = contents.get(document.id)
      return content ? [content] : []
    })
  }, [data])

  const annotatorNames = useMemo(() => {
    const names = new Map((data?.annotators ?? []).map((annotator) => [annotator.id, annotator.email]))
    let removed = 0

    grouped.forEach((byUser) => {
      byUser.forEach((_, userId) => {
        if (!names.has(userId)) {
          names.set(userId, `Removed collaborator ${++removed}`)
        }
      })
    })

    return names
  }, [data, grouped])

  const alpha = useMemo(() => krippendorffAlpha(orderedContents, grouped), [grouped, orderedContents])

  const pairScores = useMemo(() => {
    const userIds = [...annotatorNames.keys()].sort((a, b) => (
      (annotatorNames.get(a) ?? "").localeCompare(annotatorNames.get(b) ?? "")
    ))

    return scoreAllPairs(orderedContents, grouped, userIds)
  }, [annotatorNames, grouped, orderedContents])

  const pair = pairScores.find((score) => pairKey(score) === selectedPair) ?? pairScores[0]
  const documentNames = useMemo(
    () => new Map((data?.documents ?? []).map((document) => [document.id, document.name])),
    [data],
  )

  if (invalidWorkspace) {
    return <InvalidWorkspace />
  }

  const restricted = workspace !== undefined && workspace.blind_annotation && !isOwner

  if (!workspace || (!data && !restricted)) {
    return (
      <Center h="60vh">
        <Loader size="sm" />
      </Center>
    )
  }

  const toggleBlindAnnotation = (blindAnnotation: boolean) => {
    setSavingBlind(true)

    database
      .setWorkspaceBlindAnnotation(workspace.id, blindAnnotation)
      .then(() => setWorkspace({ ...workspace, blind_annotation: blindAnnotation }))
      .catch((e) => notify.error("Failed to update blind annotation.", e))
      .finally(() => setSavingBlind(false))
  }

  const nameOf = (userId: string) => annotatorNames.get(userId) ?? "Unknown"

  return (
    <Container my="md" size="xl">
      <Grid>
        <Grid.Col span={12}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fz={25} fw={700}>
                Annotator agreement
              </Text>

              <Text fz={14} c="dimmed">
                {workspace.name}
              </Text>
            </div>

            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => moveToPage(toSetupUrl(workspace.id))}
            >
              Back to setup
            </Button>
          </Group>
        </Grid.Col>

        {restricted && (
          <Grid.Col span={12}>
            <Alert icon={<IconEyeOff size={16} />} title="Blind annotation is on" color="gray">
              Annotators work independently in this workspace, so only the workspace owner can compare annotations.
            </Alert>
          </Grid.Col>
        )}

        {isOwner && (
          <Grid.Col span={12}>
            <Card shadow="xs" radius={5} p="xl">
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text fw={600}>
                    Blind annotation
                  </Text>

                  <Text fz={14} c="dimmed">
                    Each annotator only sees their own annotations while annotating, so agreement reflects independent work.
                    Only you can view this page while it is on.
                  </Text>
                </div>

                <Switch
                  aria-label="Blind annotation"
                  checked={workspace.blind_annotation}
                  disabled={savingBlind}
                  onChange={(event) => toggleBlindAnnotation(event.currentTarget.checked)}
                />
              </Group>
            </Card>
          </Grid.Col>
        )}

        {!restricted && pairScores.length === 0 && (
          <Grid.Col span={12}>
            <Alert icon={<IconInfoCircle size={16} />} title="Nothing to compare yet" color="gray">
              Agreement is measured on documents that at least two people have annotated. Add a collaborator
              from your dashboard and have each of you annotate the same documents, then come back here.
            </Alert>
          </Grid.Col>
        )}

        {pair && (
          <>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <ScoreCard
                label="Overall agreement (Krippendorff's α)"
                help={METRIC_HELP.alpha}
                value={alpha.alpha}
                detail={`${alpha.annotatorCount} annotators`}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <StatCard
                label="Documents compared"
                value={`${alpha.documentCount} of ${data?.documents.length ?? 0}`}
                detail="Annotated by two or more people"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <StatCard
                label="Words compared"
                value={alpha.tokenCount.toLocaleString()}
                detail="Unannotated words count as agreement on no entity"
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Card shadow="xs" radius={5} p="xl">
                <Text fw={600} mb="sm">
                  Annotator pairs
                </Text>

                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Annotators</Table.Th>
                      <Table.Th ta="right">Documents</Table.Th>
                      <MetricHeader label="Exact F1" help={METRIC_HELP.exact} />
                      <MetricHeader label="Relaxed F1" help={METRIC_HELP.relaxed} />
                      <MetricHeader label="Cohen's κ" help={METRIC_HELP.kappa} />
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {pairScores.map((score) => (
                      <Table.Tr
                        key={pairKey(score)}
                        style={{ cursor: "pointer" }}
                        bg={pairKey(score) === pairKey(pair) ? "var(--mantine-color-default-hover)" : undefined}
                        onClick={() => setSelectedPair(pairKey(score))}
                      >
                        <Table.Td>{nameOf(score.userA)} · {nameOf(score.userB)}</Table.Td>
                        <Table.Td ta="right">{score.documentCount}</Table.Td>
                        <ScoreCell value={score.exact.f1} />
                        <ScoreCell value={score.overlap.f1} />
                        <ScoreCell value={score.kappa} />
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>

            <Grid.Col span={12}>
              <Group justify="space-between">
                <Text fw={600}>
                  {nameOf(pair.userA)} compared with {nameOf(pair.userB)}
                </Text>

                {pairScores.length > 1 && (
                  <Select
                    w={420}
                    aria-label="Annotator pair"
                    allowDeselect={false}
                    value={pairKey(pair)}
                    onChange={setSelectedPair}
                    data={pairScores.map((score) => ({
                      value: pairKey(score),
                      label: `${nameOf(score.userA)} · ${nameOf(score.userB)}`,
                    }))}
                  />
                )}
              </Group>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card shadow="xs" radius={5} p="xl">
                <Text fw={600} mb="sm">
                  By entity
                </Text>

                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Entity</Table.Th>
                      <Table.Th ta="right">Annotations</Table.Th>
                      <MetricHeader label="Exact F1" help={METRIC_HELP.exact} />
                      <MetricHeader label="Relaxed F1" help={METRIC_HELP.relaxed} />
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {pair.entities.map((entity) => (
                      <Table.Tr key={entity.entity}>
                        <Table.Td>
                          <Badge color={(data?.entityColours ?? {})[entity.entity]} c="#333333" tt="none" radius="sm">
                            {entity.entity}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">{entity.countA} · {entity.countB}</Table.Td>
                        <ScoreCell value={entity.exact.f1} />
                        <ScoreCell value={entity.overlap.f1} />
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7 }}>
              <Card shadow="xs" radius={5} p="xl">
                <Text fw={600} mb="sm">
                  By document
                </Text>

                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Document</Table.Th>
                      <Table.Th ta="right">Annotations</Table.Th>
                      <MetricHeader label="Exact F1" help={METRIC_HELP.exact} />
                      <MetricHeader label="Relaxed F1" help={METRIC_HELP.relaxed} />
                      <MetricHeader label="Cohen's κ" help={METRIC_HELP.kappa} />
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {pair.documents.map((document) => (
                      <Table.Tr
                        key={document.documentId}
                        style={{ cursor: "pointer" }}
                        onClick={() => setOpenedDocumentId(document.documentId)}
                      >
                        <Table.Td>{documentNames.get(document.documentId)}</Table.Td>
                        <Table.Td ta="right">{document.countA} · {document.countB}</Table.Td>
                        <ScoreCell value={document.exact.f1} />
                        <ScoreCell value={document.overlap.f1} />
                        <ScoreCell value={document.kappa} />
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                <Text fz={12} c="dimmed" mt="sm">
                  Select a document to compare both annotators side by side.
                </Text>
              </Card>
            </Grid.Col>
          </>
        )}
      </Grid>

      {pair && (
        <ComparisonModal
          documentIds={pair.documents.map((document) => document.documentId)}
          documentId={openedDocumentId}
          onDocumentChange={setOpenedDocumentId}
          documentNames={documentNames}
          contents={orderedContents}
          grouped={grouped}
          userA={pair.userA}
          userB={pair.userB}
          nameA={nameOf(pair.userA)}
          nameB={nameOf(pair.userB)}
          entityColours={(data?.entityColours ?? {})}
        />
      )}
    </Container>
  )
}

function MetricHeader({ label, help }: { label: string, help: string }) {
  return (
    <Table.Th ta="right">
      <Tooltip label={help} multiline w={280}>
        <span style={{ cursor: "help", borderBottom: "1px dotted currentColor" }}>
          {label}
        </span>
      </Tooltip>
    </Table.Th>
  )
}

function ScoreCell({ value }: { value: number | null }) {
  return (
    <Table.Td ta="right">
      <Badge variant="light" color={scoreColour(value)} radius="sm">
        {formatScore(value)}
      </Badge>
    </Table.Td>
  )
}

function ScoreCard({ label, help, value, detail }: { label: string, help: string, value: number | null, detail: string }) {
  return (
    <Card shadow="xs" radius={5} p="xl" h="100%">
      <Tooltip label={help} multiline w={280}>
        <Text fz={14} c="dimmed" style={{ cursor: "help" }}>
          {label}
        </Text>
      </Tooltip>

      <Group align="baseline" gap="sm">
        <Text fz={32} fw={700}>
          {formatScore(value)}
        </Text>

        <Badge variant="light" color={scoreColour(value)}>
          {interpretAgreement(value)}
        </Badge>
      </Group>

      <Text fz={12} c="dimmed">
        {detail}
      </Text>
    </Card>
  )
}

function StatCard({ label, value, detail }: { label: string, value: string, detail: string }) {
  return (
    <Card shadow="xs" radius={5} p="xl" h="100%">
      <Text fz={14} c="dimmed">
        {label}
      </Text>

      <Text fz={32} fw={700}>
        {value}
      </Text>

      <Text fz={12} c="dimmed">
        {detail}
      </Text>
    </Card>
  )
}

export default Agreement
