import { useState } from "react"
import { createStyles, Box, Text, Group, Container, Grid, Card, Collapse, Alert, Button, Chip, Image } from "@mantine/core"
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconBook2, IconX } from "@tabler/icons"
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
    label: "Define annotation config",
    link: "#define-annotation-config",
    content: <DefineAnnotationConfig />,
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
    label: "Use an ontology",
    link: "#use-an-ontology",
    content: <UseOntology />,
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
  },
  {
    label: "Search",
    link: "#search",
    content: <Search />,
    order: 1,
  },
  {
    label: "Export",
    link: "#export",
    content: <Export />,
    order: 1,
  },
  {
    label: "Suggestions",
    link: "#suggestions",
    content: <Suggestions />,
    order: 1,
  },
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
          a <b>Company</b> entity and some attributes. Click on the card to view the attributes!

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
            <b>Annotation Config</b>
          </p>

          Each workspace has an annotation config that defines the entities and attributes that
          can be used whilst annotating documents.
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Ontologies</b>
          </p>

          Ontologies (sometimes called terminologies) are sets of mappings between concepts and
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
          <li>Define your annotation config</li>
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

      <br />

      <Image src="https://markup-storage.s3.eu-west-2.amazonaws.com/create-workspace-one.png" />

      <br />

      <Image src="https://markup-storage.s3.eu-west-2.amazonaws.com/create-workspace-two.png" />
    </Text>
  )
}

function AddDocuments() {
  return (
    <Text>
      <h2>Add documents</h2>

      <Text>
        ...
      </Text>

      <br />

      {/* <Image src={AddDocumentsImage} /> */}
    </Text>
  )
}

function DefineAnnotationConfig() {
  return (
    <Text>
      <h2>Define your annotation config</h2>

      <Text>
        ...
      </Text>

      <br />

      {/* <Image src={DefineAnnotationConfigImage} /> */}
    </Text>
  )
}

function AddCollaborators() {
  return (
    <Text>
      <h2>Start annotating!</h2>

      <Text>
        ...
      </Text>

      <br />

      {/* <Image src={StartAnnotatingImage} /> */}
    </Text>
  )
}

function UseOntology() {
  return (
    <Text>
      <h2>Select an ontology</h2>

      <Text>
        ...
      </Text>

      <br />

      {/* <Image src={SelectOntologyImage} /> */}
    </Text>
  )
}

function AddAnnotationGuidelines() {
  return (
    <Text>
      <h2>Add annotation guidelines</h2>

      <Text>
        ...
      </Text>

      <br />

      {/* <Image src={AddAnnotationGuidelinesImage} /> */}
    </Text>
  )
}

function AddExistingAnnotations() {
  return (
    <Text>
      <h2>Add existing annotations</h2>

      <Text>
        ...
      </Text>

      <br />

      {/* <Image src={AddExistingAnnotationsImage} /> */}
    </Text>
  )
}

function Annotate() {
  return (
    <>Annotate</>
  )
}

function Search() {
  return (
    <>Search</>
  )
}

function Export() {
  return (
    <>Export</>
  )
}

function Suggestions() {
  return (
    <>Suggestions</>
  )
}

export default Docs
