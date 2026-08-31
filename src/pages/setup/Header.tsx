import { ActionIcon, Group, Button, Text, TextInput, Tooltip } from "@mantine/core"
import { IconArrowRight, IconCornerDownLeft, IconPencil, IconSparkles } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Workspace, database } from "storage/database"
import { moveToPage } from "utils/Location"
import notify from "utils/Notifications"
import { Path, toAnnotateUrl } from "utils/Path"
import ConfigureAiModal from "./ConfigureAiModal"
import { SectionProps } from "./Setup"

interface HeaderProps extends SectionProps {
  onWorkspaceChange: (workspace: Workspace) => void
}

function Header({ workspace, workspaceStatus, onWorkspaceChange }: HeaderProps) {
  const { id } = useParams()

  const [openedConfigureAiModal, setOpenedConfigureAiModal] = useState(false)
  const workspaceRef = useRef(workspace)
  workspaceRef.current = workspace

  const saveMetadata = async (name: string, description: string) => {
    const previous = workspaceRef.current
    const next = {
      ...previous,
      name,
      description,
    }

    workspaceRef.current = next
    onWorkspaceChange(next)

    try {
      await database.updateWorkspace(next.id, next.name, next.description || "")
    } catch (e) {
      workspaceRef.current = previous
      onWorkspaceChange(previous)
      notify.error("Failed to update workspace.", e instanceof Error ? e : undefined)
      throw e
    }
  }

  if (id === undefined) {
    return <></>
  }

  return (
    <>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
          <InlineEditableText
            value={workspace.name}
            placeholder="Add a title..."
            editLabel="Edit name"
            required
            fz={25}
            fw={700}
            onSave={(name) => saveMetadata(name, workspaceRef.current.description || "")}
          />

          <InlineEditableText
            value={workspace.description || ""}
            placeholder="Add a description..."
            editLabel="Edit description"
            fz={14}
            c="dimmed"
            onSave={(description) => saveMetadata(workspaceRef.current.name, description)}
          />
        </div>

        <Group wrap="nowrap">
          <Button
            variant="subtle"
            onClick={() => moveToPage(Path.Dashboard)}
          >
            Exit setup
          </Button>

          <Button
            variant="subtle"
            leftSection={<IconSparkles size={16} />}
            onClick={() => setOpenedConfigureAiModal(true)}
          >
            Configure AI
          </Button>

          <Button
            disabled={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument}
            onClick={() => moveToPage(toAnnotateUrl(id))}
            variant="light"
            bg={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument ? "gray" : "green"}
            c={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument ? "darkgray" : "darkgreen"}
          >
            Annotate <IconArrowRight size={19} />
          </Button>
        </Group>
      </Group>

      <ConfigureAiModal
        workspace={workspace}
        openedModal={openedConfigureAiModal}
        setOpenedModal={setOpenedConfigureAiModal}
      />
    </>
  )
}

function InlineEditableText({
  value,
  placeholder,
  editLabel,
  required,
  fz,
  fw,
  c,
  onSave,
}: {
  value: string
  placeholder?: string
  editLabel: string
  required?: boolean
  fz: number
  fw?: number
  c?: string
  onSave: (next: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) {
      setDraft(value)
    }
  }, [editing, value])

  const startEditing = () => {
    setDraft(value)
    setEditing(true)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  const save = async () => {
    const trimmed = draft.trim()

    if (required && trimmed === "") {
      return
    }

    if (trimmed === value.trim()) {
      setEditing(false)
      setDraft(value)
      return
    }

    setSaving(true)

    try {
      await onSave(trimmed)
      setEditing(false)
    } catch {
      // Keep the draft so the user can retry or cancel.
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        style={{ marginBottom: 4 }}
      >
        <Group gap="xs" wrap="nowrap" align="center">
          <TextInput
            style={{ flex: 1, minWidth: 0 }}
            value={draft}
            placeholder={placeholder}
            autoFocus
            disabled={saving}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault()
                cancel()
              }
            }}
          />

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={saving}
            onClick={cancel}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            color="green"
            size="sm"
            loading={saving}
            disabled={required && draft.trim() === ""}
            rightSection={<IconCornerDownLeft size={14} />}
          >
            Save
          </Button>
        </Group>
      </form>
    )
  }

  return (
    <Group gap={6} wrap="nowrap" align="center">
      <Text
        fz={fz}
        fw={fw}
        c={value ? c : "dimmed"}
        style={{ cursor: "pointer", minWidth: 0 }}
        lineClamp={2}
        onClick={startEditing}
      >
        {value || placeholder}
      </Text>

      <Tooltip label={editLabel}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          aria-label={editLabel}
          onClick={startEditing}
        >
          <IconPencil size={15} />
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}

export default Header
