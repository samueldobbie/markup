import { Accordion, Container, Title } from "@mantine/core";

function Faq() {
  return (
    <Container size="sm">
      <Title
        order={2}
        size="h1"
        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}` })}
        weight={900}
      >
        FAQ
      </Title>

      <Accordion variant="filled" mt="xl">
        <Accordion.Item value="q1">
          <Accordion.Control>
            Question 1?
          </Accordion.Control>

          <Accordion.Panel>
            Answer 1
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="q2">
          <Accordion.Control>
            Question 2?
          </Accordion.Control>

          <Accordion.Panel>
            Answer 2
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="q3">
          <Accordion.Control>
            Question 3?
          </Accordion.Control>

          <Accordion.Panel>
            Answer 3
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="q4">
          <Accordion.Control>
            Question 4?
          </Accordion.Control>

          <Accordion.Panel>
            Answer 4
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="q5">
          <Accordion.Control>
            Question 5?
          </Accordion.Control>

          <Accordion.Panel>
            Answer 5
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  )
}

export default Faq
