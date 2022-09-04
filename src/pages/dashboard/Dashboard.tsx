import { Box, Container, Grid } from "@mui/material"
import AccountOverview from "./components/overview/AccountOverview"
import OntologyTable from "./components/ontology/OntologyTable"
import SessionTable from "./components/session/SessionTable"
import { useRecoilValue } from "recoil"
import { dashboardShowTutorialState } from "context/store/Dashboard"

function Dashboard(): JSX.Element {
  const showTutorial = useRecoilValue(dashboardShowTutorialState)
  
  const boxStyles = {
    my: "4%",
  }

  return (
    <Box sx={boxStyles}>
      <Container>
        <Grid container spacing={3}>
          {showTutorial &&
            <Grid item xs={12}>
              <AccountOverview />
            </Grid>
          }

          <Grid item xs={12} md={6}>
            <SessionTable />
          </Grid>

          <Grid item xs={12} md={6}>
            <OntologyTable />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Dashboard
