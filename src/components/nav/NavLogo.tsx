import markupLogoDark from "assets/images/logo/markup-logo-dark.png"
import markupLogoLight from "assets/images/logo/markup-logo-light.png"
import { Box, Link } from "@mui/material"
import { themeModeState } from "context/store/Theme"
import ThemeMode from "constants/Theme"
// import { Link } from "react-router-dom"
import { useRecoilValue } from "recoil"
import Page from "constants/Page"

function NavLogo(): JSX.Element {
  const themeMode = useRecoilValue(themeModeState)

  const logoImage = themeMode === ThemeMode.Light
    ? markupLogoDark
    : markupLogoLight

  const boxStyles = {
    marginTop: 1,
    userSelect: "none",
  }

  const imageStyles = {
    height: 20,
  }

  return (
    <Box sx={boxStyles}>
      <Link href={Page.dashboard.path}>
        <img
          src={logoImage}
          style={imageStyles}
          alt="home"
        />
      </Link>
    </Box>
  )
}

export default NavLogo
