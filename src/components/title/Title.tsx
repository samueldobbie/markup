import { Group, ActionIcon, Text } from "@mantine/core"
import { IconCaretDown, IconCaretRight, IconInfoCircle } from "@tabler/icons"

interface TitleProps {
  text: string
  description?: string
  open: boolean
  setOpen: (v: boolean) => void
}

function Title({ text, description, open, setOpen }: TitleProps) {
  return (
    <>
      <Group
        position="left"
        onClick={() => setOpen(!open)}
        sx={{ cursor: "pointer" }}
        noWrap
      >
        <ActionIcon mr={-10}>
          {open && <IconCaretDown style={{ opacity: 0.8 }} size={18} />}
          {!open && <IconCaretRight style={{ opacity: 0.8 }} size={18} />}
        </ActionIcon>

        <Text size="md">
          {text}
        </Text>

        <ActionIcon ml={-15}>
          <IconInfoCircle style={{ opacity: 0.4 }} size={18} />
        </ActionIcon>
      </Group>
    </>
  )
}

export default Title
