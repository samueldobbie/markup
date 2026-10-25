import type { ReactNode } from "react"
import { Anchor, Box, FloatingPosition, Group, Popover, Text } from "@mantine/core"
import { TutorialStep, useTutorialStep, useTutorialStore } from "storage/state/Tutorial"
import "./TutorialHint.css"

interface Props {
  step: TutorialStep
  title: string
  description: string
  position?: FloatingPosition
  children: ReactNode
}

const STEP_COUNT = Object.keys(TutorialStep).length / 2

function TutorialHint({ step, title, description, position = "right", children }: Props) {
  const activeStep = useTutorialStep()
  const finish = useTutorialStore((s) => s.finish)

  return (
    <Popover
      opened={activeStep === step}
      position={position}
      withArrow
      arrowSize={16}
      arrowOffset={20}
      offset={14}
      width={260}
      zIndex={150}
    >
      <Popover.Target>
        <Box>{children}</Box>
      </Popover.Target>

      <Popover.Dropdown className="tutorial-hint">
        <Text size="xs" opacity={0.8}>
          Step {step + 1} of {STEP_COUNT}
        </Text>

        <Text size="sm" fw={500}>
          {title}
        </Text>

        <Text size="sm" mt={4}>
          {description}
        </Text>

        <Group justify="flex-end" mt="xs">
          <Anchor size="xs" c="white" opacity={0.8} component="button" type="button" onClick={finish}>
            Skip tutorial
          </Anchor>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}

export default TutorialHint
