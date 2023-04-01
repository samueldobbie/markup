import { Accordion, Container, Title } from "@mantine/core"
import { IconStar } from "@tabler/icons"

function Faq() {
  return (
    <Container size="sm">
      <Title
        order={2}
        size="h1"
        weight={900}
      >
        FAQ
      </Title>

      <Accordion variant="filled" mt="xl">
        <Accordion.Item value="foss">
          <Accordion.Control>
            Is Markup free and open source?
          </Accordion.Control>

          <Accordion.Panel>
            Yes.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="data-safety">
          <Accordion.Control>
            Is my data safe?
          </Accordion.Control>

          <Accordion.Panel>
            All data is encrypted at rest with AES-256, and encrypted in transit via TLS. However,
            no one can guarantee 100% security. If you're annotating highly sensitive data, we recommend
            setting up a local instance of Markup.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="project-support">
          <Accordion.Control>
            How can I support Markup?
          </Accordion.Control>

          <Accordion.Panel>
            You can support Markup by hitting <IconStar size={16} color="#d1e32d" /> on <a
              href="https://github.com/samueldobbie/markup/stargazers"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container >
  )
}

export default Faq
