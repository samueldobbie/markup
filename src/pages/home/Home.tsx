import { Box } from "@mui/material"
import HeroCallToAction from "./components/HeroCallToAction"
import HeroImage from "./components/HeroImage"
import HeroText from "./components/HeroText"
import SocialProof from "./components/SocialProof"

function Home(): JSX.Element {
  const baseStyles = {
    textAlign: "center",
  }

  const sectionStyles = {
    ...baseStyles,
    my: "6%",
  }

  const callToActionStyles = {
    ...baseStyles,
    margin: "4% 0 7% 0",
  }

  return (
    <>
      <Box sx={sectionStyles}>
        <HeroText />
      </Box>

      <Box sx={callToActionStyles}>
        <HeroCallToAction />
      </Box>

      <Box sx={sectionStyles}>
        <HeroImage />
      </Box>

      <Box sx={baseStyles}>
        <SocialProof />
      </Box>
    </>
  )
}

export default Home
