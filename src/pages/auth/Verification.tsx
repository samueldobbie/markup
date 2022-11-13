import { createStyles, Title, Text, Button, Container, Group } from "@mantine/core"
import { IconMail } from "@tabler/icons"
import { Path } from "utils/Path"

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: "center",
    fontWeight: 900,
    fontSize: 38,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32,
    },
  },

  description: {
    maxWidth: 500,
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
  },
}))

function Verification() {
  const { classes } = useStyles()

  const moveToSignUp = () => {
    window.location.href = Path.SignUp
  }

  return (
    <Container className={classes.root}>
      <Title className={classes.title}>
        <IconMail size={30} /> You've got mail!
      </Title>
      
      <Text color="dimmed" size="lg" align="center" className={classes.description}>
        We've sent you an email with a link to verify your account.
      </Text>

      <Group position="center">
        <Button variant="subtle" size="md" onClick={moveToSignUp}>
          Return to sign up page
        </Button>
      </Group>
    </Container>
  )
}

export default Verification
