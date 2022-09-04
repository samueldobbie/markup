import sessionDemoDark from "assets/images/demo/session-demo-dark.png"
import sessionDemoLight from "assets/images/demo/session-demo-light.png"
import Image from "@jy95/material-ui-image"
import { Container } from "@mui/material"
import ThemeMode from "constants/Theme"
import { themeModeState } from "context/store/Theme"
import { useRecoilValue } from "recoil"

function HeroImage() {
  const themeMode = useRecoilValue(themeModeState)

  const sessionDemoImage = themeMode === ThemeMode.Light
    ? sessionDemoLight
    : sessionDemoDark

  const styles = {
    borderRadius: "5px",
    boxShadow: "0px 0px 10px 0px #333",
  }

  return (
    <Container maxWidth="xl">
      <Image
        cover
        color="primary"
        aspectRatio={1920/1171}
        src={sessionDemoImage}
        imageStyle={styles}
      />
    </Container>
  )
}

export default HeroImage
