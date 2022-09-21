import { External } from "constants/Page"
import { openTab } from "utils/Location"
import { Box, Card, CardContent, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Link, Typography } from "@mui/material"
import { useRecoilState, useSetRecoilState } from "recoil"
import { dashboardShowTutorialState, dashboardStepState } from "context/store/Dashboard"

function AccountOverview(): JSX.Element {
  const setShowTutorial = useSetRecoilState(dashboardShowTutorialState)

  return (
    <Card sx={{ userSelect: "none" }}>
      <CardContent>
        <Box>
        <Typography
            onClick={() => setShowTutorial(false)}
            sx={{
              opacity: 0.7,
              cursor: "pointer",
              float: "right",
            }}
          >
            (hide message)
          </Typography>

          <Typography paragraph variant="h6">
            Welcome to Markup!
          </Typography>

          <Typography paragraph>
            {"You're"} currently on the dashboard where you can easily
            create and manage annotation sessions and ontologies.
          </Typography>

          <NextSteps />
        </Box>
      </CardContent>
    </Card>
  )
}

function NextSteps(): JSX.Element {
  const [checkedSteps, setCheckedSteps] = useRecoilState(dashboardStepState)

  const openDocs = () => {
    setCheckedSteps({
      ...checkedSteps,
      openedDocs: true,
    })

    openTab(External.docs.url)
  }

  return (
    <FormControl component="fieldset" variant="standard">
      <Typography paragraph sx={{ mt: 1 }}>
        Next Steps
      </Typography>

      <FormGroup>
        <FormControlLabel
          label={
            <>
              Read the <Link
                onClick={openDocs}
                sx={{ fontWeight: 600 }}
              >
                docs
              </Link>
            </>
          }
          control={
            <Checkbox
              checked={checkedSteps.openedDocs}
              name="openedDocs"
            />
          }
        />

        <FormControlLabel
          label="Create an annotation session"
          control={
            <Checkbox
              checked={checkedSteps.createdSession}
              name="createdSession"
            />
          }
        />

        <FormControlLabel
          label="Add an ontology"
          control={
            <Checkbox
              checked={checkedSteps.addedOntology}
              name="addedOntology"
            />
          }
        />
      </FormGroup>
    </FormControl>
  )
}

export default AccountOverview
