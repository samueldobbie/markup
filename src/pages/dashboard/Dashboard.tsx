import { Box, Container, Grid } from "@mui/material"
import AccountOverview from "./components/overview/AccountOverview"
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
        </Grid>
      </Container>
    </Box>
  )
}

export default Dashboard
