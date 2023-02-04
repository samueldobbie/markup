import { createStyles, Title, Button, Container, Group } from "@mantine/core"
import { Path } from "utils/Path"

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: 80,
    paddingBottom: 80,
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: 50,
    lineHeight: 1,
    marginBottom: theme.spacing.xl * 1.5,
    color: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2],

    [theme.fn.smallerThan("sm")]: {
      fontSize: 120,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: "center",
    fontWeight: 900,
    fontSize: 20,
  },

  description: {
    maxWidth: 500,
    margin: "auto",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl * 1.5,
  },
}))

function InvalidWorkspace() {
  const { classes } = useStyles()

  const moveToDashboard = () => {
    window.location.href = Path.Dashboard
  }

  return (
    <Container className={classes.root} size="xs">
      <div className={classes.label}>
        Invalid workspace
      </div>

      <Title className={classes.title}>
        The workspace you are trying to access does not exist, or you do not have sufficient permissions to access it.
      </Title>

      <Group position="center" mt={50}>
        <Button variant="filled" size="md" onClick={moveToDashboard}>
          Go to dashboard
        </Button>
      </Group>
    </Container>
  )
}

export default InvalidWorkspace
