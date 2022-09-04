import { Button } from "@mui/material"
import Page from "constants/Page"
import { userState } from "context/store/Auth"
import { Link } from "react-router-dom"
import { useRecoilValue } from "recoil"

function HeroCallToAction() {
  const user = useRecoilValue(userState)
  
  const primaryButtonText = user
    ? "Go to dashboard"
    : "Get started"

  const styles = {
    fontWeight: "bold",
    fontSize: 20,
  }

  return (
    <>
      <Button
        variant="contained"
        size="large"
        color="primary"
        component={Link}
        to={Page.auth.signUp.path}
        sx={{
          ...styles,
          mr: 2,
        }}
      >
        {primaryButtonText}
      </Button>

      <Button
        variant="text"
        size="large"
        color="primary"
        component={Link}
        to={"demoooo"}
        sx={styles}
      >
        Try demo
      </Button>
    </>
  )
}

export default HeroCallToAction
