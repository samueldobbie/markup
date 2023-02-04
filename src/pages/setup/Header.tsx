import { Group, Button, Text } from "@mantine/core"
import { IconArrowRight } from "@tabler/icons"
import { useParams } from "react-router-dom"
import { moveToPage } from "utils/Location"
import { Path, toAnnotateUrl } from "utils/Path"
import { SectionProps } from "./Setup"

function Header({ workspace, workspaceStatus }: SectionProps) {
  const { id } = useParams()

  if (id === undefined) {
    return <></>
  }

  return (
    <Group position="apart">
      <div>
        <Text size={25} sx={{ fontWeight: "bold" }}>
          {workspace.name}
        </Text>

        <Text color="dimmed" size={14}>
          {workspace.description || "No description"}
        </Text>
      </div>

      <Group>
        <Button
          variant="subtle"
          onClick={() => moveToPage(Path.Dashboard)}
        >
          Back to dashboard
        </Button>

        <Button
          disabled={!workspaceStatus.hasConfig || !workspaceStatus.hasDocument}
          onClick={() => moveToPage(toAnnotateUrl(id))}
          variant="light"
          color="green"
        >
          Annotate <IconArrowRight size={19} />
        </Button>
      </Group>
    </Group>
  )
}

export default Header
