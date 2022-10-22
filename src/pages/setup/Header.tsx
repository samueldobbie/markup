import { Group, Button, Text } from "@mantine/core"
import { useParams } from "react-router-dom"
import { moveToPage } from "utils/Location"
import { Path, toAnnotateUrl } from "utils/Path"
import { SectionProps } from "./Interfaces"

function Header({ workspace }: SectionProps) {
  const { id } = useParams()

  if (id === undefined) {
    return <></>
  }

  return (
    <Group position="apart">
      <Text size={28} sx={{ fontWeight: "bold" }}>
        {workspace.name}
      </Text>

      <Group>
        <Button variant="subtle" onClick={() => moveToPage(Path.Dashboard)}>
          Back to dashboard
        </Button>

        <Button onClick={() => moveToPage(toAnnotateUrl(id))}>
          Start annotating
        </Button>
      </Group>
    </Group>
  )
}

export default Header
