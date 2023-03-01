import { Card, Stepper } from "@mantine/core"
import { Link } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { activeTutorialStepState } from "storage/state"
import { Path } from "utils/Path"

function Tutorial(): JSX.Element {
  const active = useRecoilValue(activeTutorialStepState)

  return (
    <Card>
      <Stepper active={active} allowNextStepsSelect={false}>
        <Stepper.Step
          label="Define the annotated concept"
          description={
            <>
              Using the panel on the left, select an entity that describes the
              category of text you want to annotate, and populate any number of
              attributes to describe the concept.
            </>
          }
        />

        <Stepper.Step
          label="Select text to annotate"
          description={
            <>
              Using the central panel, select the text you want to annotate. You
              can select a single word, a phrase, or a whole paragraph.
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
