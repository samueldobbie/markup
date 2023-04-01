import { useEffect, useState } from "react"
import { createStyles, Box, Text, Group, Container, Grid, Card, Collapse, Alert, Button, Code } from "@mantine/core"
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconBook2, IconFilePlus, IconUsers, IconX } from "@tabler/icons"
import { Path } from "utils/Path"

const LINK_HEIGHT = 38
const INDICATOR_SIZE = 10
const INDICATOR_OFFSET = (LINK_HEIGHT - INDICATOR_SIZE) / 2
const DOCUMENTATION = [
  {
    label: "What is Markup?",
    link: "#what-is-markup",
    content: <WhatIsMarkup />,
    order: 1,
  },
  {
    label: "Core concepts",
    link: "#core-concepts",
    content: <CoreConcepts />,
    order: 1,
  },
  {
    label: "Getting started",
    link: "#getting-started",
    content: <GettingStarted />,
    order: 1,
  },
  {
    label: "Create a workspace",
    link: "#create-a-workspace",
    content: <CreateWorkspace />,
    order: 2,
  },
  {
    label: "Add documents",
    link: "#add-documents",
    content: <AddDocuments />,
    order: 2,
  },
  {
    label: "Add config",
    link: "#add-config",
    content: <AddConfig />,
    order: 2,
  },
  {
    label: "Add annotation guidelines",
    link: "#add-annotation-guidelines",
    content: <AddAnnotationGuidelines />,
    order: 2,
    isAdvanced: true,
  },
  {
    label: "Add collaborators",
    link: "#add-collaborators",
    content: <AddCollaborators />,
    order: 2,
    isAdvanced: true,
  },
  {
    label: "Add an ontology",
    link: "#add-an-ontology",
    content: <AddOntology />,
    order: 2,
    isAdvanced: true,
  },
  {
    label: "Add existing annotations",
    link: "#add-existing-annotations",
    content: <AddExistingAnnotations />,
    order: 2,
    isAdvanced: true,
  },
  {
    label: "Annotate",
    link: "#annotate",
    content: <Annotate />,
    order: 1,
  }
  // {
  //   label: "Search",
  //   link: "#search",
  //   content: <Search />,
  //   order: 1,
  // },
  // {
  //   label: "Export",
  //   link: "#export",
  //   content: <Export />,
  //   order: 1,
  // },
  // {
  //   label: "Suggestions",
  //   link: "#suggestions",
  //   content: <Suggestions />,
  //   order: 1,
  // },
]

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    display: "block",
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    lineHeight: `${LINK_HEIGHT}px`,
    fontSize: theme.fontSizes.sm,
    height: LINK_HEIGHT,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    borderLeft: `2px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  linkActive: {
    fontWeight: 500,
    color: theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
  },

  links: {
    position: "relative",
  },

  indicator: {
    transition: "transform 150ms ease",
    border: `2px solid ${theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7]}`,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    height: INDICATOR_SIZE,
    width: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE,
    position: "absolute",
    left: -INDICATOR_SIZE / 2 + 1,
  },
}))

function Docs() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const hash = window.location.hash
    const index = DOCUMENTATION.findIndex((item) => item.link === hash)

    if (index !== -1) {
      setActive(index)
    }
  }, [])

  return (
    <Container>
      <Grid>
        <Grid.Col xs={3}>
          <TableOfContents
            active={active}
            setActive={setActive}
          />
        </Grid.Col>

        <Grid.Col xs={9}>
          <Content
            active={active}
            setActive={setActive}
          />
        </Grid.Col>
      </Grid>
    </Container>
  )
}

function TableOfContents({ active, setActive }: any) {
  const { classes, cx } = useStyles()

  const items = DOCUMENTATION.map((item, index) => (
    <Box<"a">
      component="a"
      href={item.link}
      onClick={(event) => {
        event.preventDefault()
        setActive(index)
      }}
      key={item.label}
      className={cx(classes.link, { [classes.linkActive]: active === index })}
      sx={(theme) => ({ paddingLeft: item.order * theme.spacing.md })}
    >
      {item.label}
    </Box>
  ))

  return (
    <div>
      <Group mb="md">
        <IconBook2 size={16} />

        <Text weight="bold">
          Docs
        </Text>
      </Group>

      <div className={classes.links}>
        <div
          className={classes.indicator}
          style={{ transform: `translateY(${active * LINK_HEIGHT + INDICATOR_OFFSET}px)` }}
        />

        {items}
      </div>
    </div>
  )
}

function Content({ active, setActive }: any) {
  return (
    <>
      {DOCUMENTATION[active].content}

      <Group position="apart" mt={40} mb={40}>
        {active > 0 ? (
          <Button
            variant="subtle"
            onClick={() => setActive((active - 1) % DOCUMENTATION.length)}
          >
            <IconArrowLeft size={20} /> {DOCUMENTATION[(active + - 1) % DOCUMENTATION.length].label}
          </Button>
        ) : (
          <Button
            variant="subtle"
            disabled
          >
            <IconArrowLeft size={20} /> Previous
          </Button>
        )}

        {active < DOCUMENTATION.length - 1 ? (
          <Button
            variant="subtle"
            onClick={() => setActive((active + 1) % DOCUMENTATION.length)}
          >
            {DOCUMENTATION[(active + 1) % DOCUMENTATION.length].label} <IconArrowRight size={20} />
          </Button>
        ) : (
          <Button
            variant="subtle"
            disabled
          >
            Next <IconArrowRight size={20} />
          </Button>
        )}
      </Group>
    </>
  )
}

function WhatIsMarkup() {
  return (
    (
      <>
        <h2>What is Markup?</h2>

        <Text>
          Markup is an online annotation tool that can be used to
          transform unstructured documents into structured formats
          for NLP and ML tasks, such as named-entity recognition.
          Markup learns as you annotate to predict and suggest complex
          annotations, and also provides integrated access to common
          and custom ontologies for concept mapping.
        </Text>
      </>
    )
  )
}

function CoreConcepts() {
  const [open, setOpen] = useState(false)

  const attributes = [
    {
      name: "CEO",
      value: "Tim Cook",
    },
    {
      name: "Founded",
      value: "1976",
    },
    {
      name: "Headquarters",
      value: "Cupertino, California",
    }
  ]

  return (
    (
      <>
        <h2>Core concepts</h2>

        <Text>
          Markup is built around a few core concepts that are important to understand:
        </Text>

        <Card mb={20} mt={20}>
          <p>
            <b>Workspaces</b>
          </p>

          Workspaces are the basic unit of organization in Markup. A workspace
          contains a set of documents, annotations, guidelines, and configurations
          that can be shared with other users.
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Documents</b>
          </p>

          A document can be any text-based file that you want to annotate (e.g. .txt, .pdf, .docx files).
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Annotations</b>
          </p>

          An annotation is a subset of a document that has been annotated with
          an entity, and any number of attributes. Here's an example of an annotation that has
          a <b>Company</b> entity and some attributes. Try clicking on the card to view the attributes!

          <br />
          <br />

          <Card
            radius={2}
            p="sm"
            sx={{
              backgroundColor: "#85f1e5",
              color: "#333333",
              cursor: "pointer",
              width: 250,
            }}
            onClick={() => setOpen(!open)}
          >
            <Grid>
              <Grid.Col xs={2}>
                <IconX
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation()
                    alert("Ouch! Don't delete me!")
                  }}
                />
              </Grid.Col>

              <Grid.Col xs={10} sx={{ userSelect: "none" }}>
                <Text>
                  Apple Inc.
                </Text>

                <Text color="dimmed" size={12} sx={{ cursor: "pointer" }}>
                  {attributes.length} attributes
                </Text>
              </Grid.Col>
            </Grid>

            <Collapse in={open} mt={10}>
              {attributes.map((attribute, index) => (
                <Text size={12} key={index}>
                  {attribute.name}

                  <Text color="dimmed">
                    {attribute.value}
                  </Text>
                </Text>
              ))}
            </Collapse>
          </Card>
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Entities</b>
          </p>

          Entites are the high-level concepts that you want to capture within your documents. These
          are typically nouns (e.g. <b>Company</b>, <b>Person</b>, <b>Location</b>).
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Attributes</b>
          </p>

          Attributes provide more detailed information about an entity (e.g. You may have a <b>Street Address</b> attribute for a <b>Location</b> entity).
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Config</b>
          </p>

          Each workspace has a config that defines the entities and attributes that
          can be used whilst annotating documents.
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Ontologies</b>
          </p>

          Ontologies (often called terminologies) are sets of mappings between concepts and
          codes. For example, a medical ontology may map the concept <b>Flu</b> to the
          code <b>C0004096</b>. Markup provides in-built access to a number of common ontologies (e.g. UMLS),
          and also allows you to upload your own custom ontologies.
        </Card>
      </ >
    )
  )
}

function GettingStarted() {
  return (
    <Text>
      <h2>Getting Started</h2>

      <Alert icon={<IconAlertCircle size={16} />} title="Account Required!">
        <Group>
          <Text>
            This guide assumes you already have a Markup account. <span
              onClick={() => window.open(Path.SignUp, "_blank")}
              style={{
                color: "#6F72E9",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Need to create one?
            </span>
          </Text>
        </Group>
      </Alert>

      <br />

      <Text>
        To start a basic annotation session, you need to:

        <ol>
          <li>Create a workspace</li>
          <li>Upload some documents</li>
          <li>Define your config</li>
          <li>Start annotating!</li>
        </ol>

        More advanced users may also want to select/upload an ontology, or add annotation guidelines.
      </Text>
    </Text>
  )
}

function CreateWorkspace() {
  return (
    <Text>
      <h2>Create a workspace</h2>

      <Text>
        To create a workspace:

        <ol>
          <li>Open your dashboard</li>
          <li>Click on <b>Create workspace</b></li>
          <li>Enter a name and (optionally) a description of the workspace</li>
        </ol>
      </Text>
    </Text>
  )
}

function AddDocuments() {
  return (
    <Text>
      <h2>Add documents</h2>

      <Alert icon={<IconAlertCircle size={16} />} title="File Format" color="orange">
        <Group>
          <Text>
            Markup currently only supports plain text (.txt) files. We're working on adding support for
            other file formats (e.g. .pdf, .docx).
          </Text>
        </Group>
      </Alert>

      <br />

      <Text>
        To add documents:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Add documents</b></li>
          <li>Upload one or more documents</li>
        </ol>
      </Text>
    </Text>
  )
}

function AddConfig() {
  return (
    <Text>
      <h2>Add config</h2>

      <Text>
        If you don't already have a config, you can create one on the workspace setup
        page by clicking <b>Create config</b> and following the guide.
      </Text>

      <br />

      <Text>
        To add an existing config:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Add coinfig</b></li>
          <li>Upload your config</li>
        </ol>
      </Text>
    </Text>
  )
}

function AddAnnotationGuidelines() {
  return (
    <Text>
      <h2>Add annotation guidelines</h2>

      <Text>
        To add annotation guidelines:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Add guidelines</b></li>
          <li>Upload your guidelines</li>
        </ol>
      </Text>
    </Text>
  )
}

function AddCollaborators() {
  return (
    <Text>
      <h2>Add collaborators</h2>

      <Alert icon={<IconAlertCircle size={16} />} title="Existing Users" color="orange">
        <Group>
          <Text>
            The collaborator email you share your workspace with must already be registered
            to an existing Markup account.
          </Text>
        </Group>
      </Alert>

      <br />

      <Text>
        To add collaborators:

        <ol>
          <li>Visit your dashboard</li>
          <li>Click on the collaborator icon (<IconUsers size={16} color="#acf2fa" />) next to the desired workspace</li>
          <li>Enter the email address of each collaborator</li>
        </ol>
      </Text>
    </Text>
  )
}

function AddOntology() {
  const json = `
    [
      {
        "code": "1",
        "name": "flu"
      },
      {
        "code": "2",
        "name": "paracetamol"
      }
    ]
  `

  return (
    <Text>
      <h2>Add ontology</h2>

      <Text>
        To add an ontology:

        <ol>
          <li>Open your dashboard</li>
          <li>Click <b>Add ontology</b></li>
          <li>Give your ontology a name and (optionally) a description</li>
          <li>Upload concept mappings</li>
        </ol>

        Concept mappings must be in the <b>JSON</b> format, and be structured as follows:

        <br />
        <br />

        <Code block>
          {json}
        </Code>
      </Text>
    </Text>
  )
}

function AddExistingAnnotations() {
  return (
    <Text>
      <h2>Add existing annotations</h2>

      <Text>
        To add existing annotations:

        <ol>
          <li>Open your workspace</li>
          <li>Click the annotation icon (<IconFilePlus size={16} color="#acf2fa" />) next to the desired document</li>
          <li>Upload your annotations</li>
        </ol>
      </Text>
    </Text>
  )
}

function Annotate() {
  return (
    <Text>
      <h2>Annotate</h2>

      <Text>
        To annotate a document, highlight a span of text, select an entity,
        and then populate the desired attributes.
      </Text>
    </Text>
  )
}

function Search() {
  return (
    <Text>
      <h2>Search</h2>
    </Text>
  )
}

function Export() {
  return (
    <Text>
      <h2>Export</h2>
    </Text>
  )
}

function Suggestions() {
  return (
    <Text>
      <h2>Suggestions</h2>
    </Text>
  )
}

export default Docs
