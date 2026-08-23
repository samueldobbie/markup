import { Title, Text, Button, Container, Group } from "@mantine/core"
import { Path } from "utils/Path"
import classes from "./ErrorPage.module.css"

function NotFound() {
  const moveToHome = () => {
    window.location.href = Path.Home
  }

  return (
    <Container className={classes.root}>
      <div className={classes.label}>
        404
      </div>

      <Title className={classes.title}>
        You have found a secret place.
      </Title>

      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
        been moved to another URL.
      </Text>

      <Group justify="center">
        <Button variant="subtle" size="md" onClick={moveToHome}>
          Take me back to home page
        </Button>
      </Group>
    </Container>
  )
}

export default NotFound
