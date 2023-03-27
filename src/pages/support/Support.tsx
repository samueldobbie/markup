import { Title, Container, Text } from "@mantine/core"

function Support() {
  return (
    <Container size="sm">
      <Title
        order={2}
        size="h1"
        weight={900}
      >
        Get in touch
      </Title>

      <Text mt={20}>
        If you have any questions, please feel free to reach out at <a href="mailto:sam@getmarkup.com">
          sam@getmarkup.com
        </a>
      </Text>
    </Container>
  )
}

export default Support
