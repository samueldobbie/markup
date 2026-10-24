import type { ReactNode } from "react"
import { Anchor, Box, Group, Popover, Text } from "@mantine/core"
import { TutorialStep, useTutorialStep, useTutorialStore } from "storage/state/Tutorial"

interface Props {
  step: TutorialStep
  title: string
  description: string
  children: ReactNode
}

const STEP_COUNT = Object.keys(TutorialStep).length / 2

function TutorialHint({ step, title, description, children }: Props) {
  const activeStep = useTutorialStep()
  const setCompleted = useTutorialStore((s) => s.setCompleted)

  return (
    <Popover
      opened={activeStep === step}
      position="right"
      withArrow
      shadow="md"
      width={260}
      zIndex={150}
    >
      <Popover.Target>
        <Box>{children}</Box>
      </Popover.Target>

      <Popover.Dropdown>
        <Text size="xs" c="dimmed">
          Step {step + 1} of {STEP_COUNT}
        </Text>

        <Text size="sm" fw={500}>
          {title}
        </Text>

        <Text size="sm" mt={4}>
          {description}
        </Text>

        <Group justify="flex-end" mt="xs">
          <Anchor size="xs" c="dimmed" component="button" type="button" onClick={() => setCompleted(true)}>
            Skip tutorial
          </Anchor>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}

export default TutorialHint
