import { SxProps, Typography, useTheme } from "@mui/material"

function HeroText() {
  return (
    <>
      <HeroHeadline />
      <HeroSubtitle />
    </>
  )
}

function HeroHeadline(): JSX.Element {
  const theme = useTheme()
  const styles = {
    textAlign: "center",
    fontWeight: "bold",
    lineHeight: 1.5,
    [theme.breakpoints.up("md")]: {
      fontSize: "3.2em",
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "2em",
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.5em",
    },
  } as SxProps

  return (
    <Typography
      gutterBottom
      sx={styles}
    >
      Transform text into structured 
      <br />
      data, without the hassle.
    </Typography>
  )
}

function HeroSubtitle(): JSX.Element {
  const theme = useTheme()
  const styles = {
    color: "text.secondary",
    textAlign: "center",
    fontWeight: 400,
    lineHeight: 1.5,
    [theme.breakpoints.up("md")]: {
      fontSize: 22,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 18,
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: 12,
    },
  } as SxProps

  return (
    <Typography
      paragraph
      gutterBottom
      sx={styles}
    >
      Markup is an annotation tool that enables you to <br/>
      rapidly build datasets from free-text for NLP and ML.
    </Typography>
  )
}

export default HeroText
