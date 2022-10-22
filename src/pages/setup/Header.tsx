import { Group, Button, Text } from "@mantine/core"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { SectionProps } from "./Interfaces"

function Header({ workspace }: SectionProps) {
  return (
    <Group position="apart">
      <Text size={28} sx={{ fontWeight: "bold" }}>
        {workspace.name}
      </Text>

      <Group>
        <Button variant="subtle" onClick={() => moveToPage(Path.Dashboard)}>
          Back to dashboard
        </Button>

        <Button>
          Start session
        </Button>
      </Group>
    </Group>
  )
}

export default Header
