import { Button } from "@mui/material"
import { Internal } from "constants/Page"
import { userState } from "context/store/Auth"
import { Link } from "react-router-dom"
import { useRecoilValue } from "recoil"

function HeroCallToAction() {
  const user = useRecoilValue(userState)
  
  const primaryButtonText = user
    ? "Visit dashboard"
    : "Start annotating"

  const coreButtonStyles = {
    fontWeight: "bold",
    fontSize: 20,
  }

  const primaryButtonStyles = {
    ...coreButtonStyles,
    mr: 2,
  }

  return (
    <>
      <Button
        variant="contained"
        size="large"
        color="primary"
        component={Link}
        to={Internal.auth.signUp.path}
        sx={primaryButtonStyles}
      >
        {primaryButtonText}
      </Button>

      <Button
        variant="text"
        size="large"
        color="primary"
        component={Link}
        to={Internal.session.demo.path}
        sx={coreButtonStyles}
      >
        Try demo
      </Button>
    </>
  )
}

export default HeroCallToAction
