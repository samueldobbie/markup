import { Title, Button, Container, Group } from "@mantine/core"
import { Path } from "utils/Path"
import classes from "./ErrorPage.module.css"

function InvalidWorkspace() {
  const moveToDashboard = () => {
    window.location.href = Path.Dashboard
  }

  return (
    <Container className={classes.root} size="xs">
      <div className={classes.invalidLabel}>
        Invalid workspace
      </div>

      <Title className={classes.invalidTitle}>
        The workspace you are trying to access does not exist, or you do not have sufficient permissions to access it.
      </Title>

      <Group justify="center" mt={50}>
        <Button variant="filled" size="md" onClick={moveToDashboard}>
          Go to dashboard
        </Button>
      </Group>
    </Container>
  )
}

export default InvalidWorkspace
