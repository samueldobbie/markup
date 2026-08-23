import type { ReactNode } from "react"
import { Group, Text, Stack } from "@mantine/core"

interface TitleProps {
  text: string
  description?: string
  open: boolean
  setOpen: (v: boolean) => void
  number: ReactNode
}

function Title({ text, description, open, setOpen, number }: TitleProps) {
  return (
    <Group
      justify="space-between"
      onClick={() => setOpen(!open)}
      style={{ cursor: "pointer" }}
      wrap="nowrap"
    >
      <Stack gap={0}>
        <Text size="md">
          {number} {text}
        </Text>

        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Group>
  )
}

export default Title
