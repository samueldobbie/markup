import { createStyles, Title, Text, Button, Container, Image, useMantineTheme } from "@mantine/core"
import { Path } from "utils/Path"
import Dots from "./Dots"
import SocialProof from "./SocialProof"

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 120,
    paddingBottom: 80,

    "@media (max-width: 755px)": {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  dots: {
    position: "absolute",
    color: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],

    "@media (max-width: 755px)": {
      display: "none",
    },
  },

  dotsLeft: {
    left: 0,
    top: 0,
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: 50,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    "@media (max-width: 520px)": {
      fontSize: 28,
      textAlign: "left",
    },
  },

  highlight: {
    color: theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6],
  },

  description: {
    textAlign: "center",

    "@media (max-width: 520px)": {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    "@media (max-width: 520px)": {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    "@media (max-width: 520px)": {
      height: 42,
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },
}))

function Home(): JSX.Element {
  const { classes } = useStyles()

  const theme = useMantineTheme()
  const demoImage = theme.colorScheme === "dark"
    ? "https://i.imgur.com/uqnXoX0.png"
    : "https://i.imgur.com/BmqM0yT.png"

  return (
    <>
      <Container className={classes.wrapper} size={1400}>
        <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
        <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

        <div className={classes.inner}>
          <Title className={classes.title}>
            Turn text into{" "}
            <Text component="span" className={classes.highlight} inherit>
              structured data
            </Text>,<br />without the hassle.
          </Title>

          <Container p={20} size={600}>
            <Text size="lg" color="dimmed" className={classes.description}>
              Markup is an annotation tool that enables you to rapidly build
              datasets from free-text for NLP and ML. Powered by GPT-3.
            </Text>
          </Container>

          <div className={classes.controls}>
            <Button
              className={classes.control}
              size="lg"
              variant="default"
              color="gray"
              component="a"
              href={Path.Demo}
            >
               Try demo
            </Button>

            <Button className={classes.control} size="lg" component="a" href={Path.SignUp}>
              Get started
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 150 }}>
          <Image src={demoImage} radius={5} />
        </div>

        <div style={{ marginTop: 80 }}>
          <SocialProof />
        </div>
      </Container>
    </>
  )
}

export default Home
