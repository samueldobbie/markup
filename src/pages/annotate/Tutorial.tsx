import { Card, Stepper } from "@mantine/core"
import { Link } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { activeTutorialStepState } from "storage/state"
import { Path } from "utils/Path"

function Tutorial(): JSX.Element {
  const active = useRecoilValue(activeTutorialStepState)

  return (
    <Card shadow="xs" radius={5} p="xl">
      <Stepper active={active} allowNextStepsSelect={false}>
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
    </Card>
  )
}

export default Tutorial
