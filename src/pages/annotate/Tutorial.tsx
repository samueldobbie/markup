import { useState } from "react"
import { useAnnotateStore } from "storage/state/Annotate"
import { ActionIcon, Card, Collapse, Group, Stepper, Text } from "@mantine/core"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { Path } from "utils/Path"

function Tutorial() {
  const active = useAnnotateStore((s) => s.activeTutorialStep)
  const [opened, setOpened] = useState(true)

  return (
    <Card shadow="xs" radius={5} p="xl">
      <Group justify="space-between">
        <Text fw={500}>Getting started</Text>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => setOpened((o) => !o)}
          aria-label={opened ? "Collapse tutorial" : "Expand tutorial"}
        >
          {opened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </ActionIcon>
      </Group>

      <Collapse in={opened}>
        <Stepper
          active={active}
          allowNextStepsSelect={false}
          orientation="vertical"
          mt="md"
        >
          <Stepper.Step
            label="Select text to annotate"
            description={
              <>
                Highlight the span of text you want to annotate in the
                document by clicking-and-dragging your mouse.
              </>
            }
          />

          <Stepper.Step
            label="Describe what you're annotating"
            description={
              <>
                Within the left panel, select an entity that describes the
                type of concept you're annotating (e.g. "Person"), and populate
                any number of attributes to describe the details of the concept
                you're annotating (e.g. "Name", "Age").
              </>
            }
          />

          <Stepper.Step
            label="Bravo!"
            description={
              <>
                That's all it takes to add a basic annotation with Markup. To start
                working on more complex workflows, read the <Link
                  to={Path.Docs}
                  target="_blank"
                >
                  docs
                </Link>.
              </>
            }
          />
        </Stepper>
      </Collapse>
    </Card>
  )
}

export default Tutorial
