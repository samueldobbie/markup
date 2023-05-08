import { Group, ActionIcon, Text, Stack } from "@mantine/core"
import { IconCaretDown, IconCaretRight, IconInfoCircle, IconNumber1, IconNumber2 } from "@tabler/icons"

interface TitleProps {
  text: string
  description?: string
  open: boolean
  setOpen: (v: boolean) => void
  number: JSX.Element
}

function Title({ text, description, open, setOpen, number }: TitleProps) {
  return (
    <Group
      position="apart"
      onClick={() => setOpen(!open)}
      sx={{ cursor: "pointer" }}
      noWrap
    >
      <Stack spacing={0}>
        <Text size="md">
          {number} {text}
        </Text>

        <Text size="xs" color="dimmed">
          {description}
        </Text>
      </Stack>
    </Group>
  )
}

export default Title
