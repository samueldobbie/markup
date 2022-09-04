import nhsLogoDark from "assets/images/logo/nhs-logo-dark.png"
import nhsLogoLight from "assets/images/logo/nhs-logo-light.png"
import sailLogoDark from "assets/images/logo/sail-logo-dark.png"
import sailLogoLight from "assets/images/logo/sail-logo-light.png"
import { Container, Paper, Typography } from "@mui/material"
import ThemeMode from "constants/Theme"
import { themeModeState } from "context/store/Theme"
import { useRecoilValue } from "recoil"

function SocialProof() {
  const themeMode = useRecoilValue(themeModeState)

  const logoImages = themeMode === ThemeMode.Light
    ? [nhsLogoDark, sailLogoDark]
    : [nhsLogoLight, sailLogoLight]

  const paperStyles = {
    minHeight: "15vh",
    textAlign: "center",
  }

  const imageStyles = {
    opacity: "40%",
    margin: "0 25px 0 25px",
  }

  return (
    <Paper
      elevation={0}
      sx={paperStyles}
    >
      <Typography
        gutterBottom
        variant="h6"
        sx={{ paddingTop: "2%" }}
      >
        Trusted by teams at organizations like
      </Typography>

      <Container sx={{ padding: "2%" }}>
        {logoImages.map((logo, index) => (
          <img
            key={index}
            src={logo}
            height={50}
            style={imageStyles}
            alt="Organization logo"
          />
        ))}
      </Container>
    </Paper>
  )
}

export default SocialProof
