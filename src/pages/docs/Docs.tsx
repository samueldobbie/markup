import { useEffect, useState } from "react"
import { createStyles, Box, Text, Group, Container, Grid, Card, Collapse, Alert, Button, Code } from "@mantine/core"
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconBook2, IconFilePlus, IconPlayerPlay, IconUsers, IconX } from "@tabler/icons"
import { Path } from "utils/Path"
import { toKebabCase } from "utils/Text"

const LINK_HEIGHT = 38
const INDICATOR_SIZE = 10
const INDICATOR_OFFSET = (LINK_HEIGHT - INDICATOR_SIZE) / 2
const DOCUMENTATION = [
  {
    label: "What is Markup?",
    content: <WhatIsMarkup />,
    order: 1,
  },
  {
    label: "Core concepts",
    content: <CoreConcepts />,
    order: 1,
  },
  {
    label: "Basic usage",
    content: <BasicUsage />,
    order: 1,
  },
  {
    label: "Create a workspace",
    content: <CreateWorkspace />,
    order: 2,
  },
  {
    label: "Setup a config",
    content: <SetupConfig />,
    order: 2,
  },
  {
    label: "Upload documents",
    content: <UploadDocuments />,
    order: 2,
  },
  {
    label: "Add an annotation",
    content: <AddAnnotation />,
    order: 2,
  },
  {
    label: "Additional features",
    content: <AdditionalFeatures />,
    order: 1,
  },
  {
    label: "AI-assisted annotation",
    content: <AssistedAnnotation />,
    order: 2,
  },
  {
    label: "Upload existing annotations",
    content: <UploadExistingAnnotations />,
    order: 2,
  },
  {
    label: "Set annotation guidelines",
    content: <SetAnnotationGuidelines />,
    order: 2,
  },
  {
    label: "Add an ontology",
    content: <AddOntology />,
    order: 2,
  },
  {
    label: "Search documents",
    content: <SearchDocuments />,
    order: 2,
  },
  {
    label: "Export annotations",
    content: <ExportAnnotations />,
    order: 2,
  },
  {
    label: "Collaborate",
    content: <Collaborate />,
    order: 2,
  },
].map((item) => ({
  ...item,
  link: `#${toKebabCase(item.label)}`,
}))

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

        <br />

        <Text>
          Markup uses GPT-3.5 to predict and suggest entities and attributes
          to speed up the annotation process and reduce the amount of manual
          input required.
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

          Entities represent the key concepts you aim to identify within documents,
          usually taking the form of nouns (e.g. <b>Company</b>, <b>Person</b>, <b>Location</b>).
        </Card>

        <Card mb={20} mt={20}>
          <p>
            <b>Attributes</b>
          </p>

          Attributes are more detailed bits of information about an entity (e.g. a <b>Street Address</b> attribute for a <b>Location</b> entity).
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


          Ontologies, or terminologies, consist of concept-to-code mappings (e.g. a medical ontology may link <b>Flu</b> to the code <b>C0004096</b>).
          Markup offers built-in access to common ontologies (e.g. UMLS), and allows you to upload your own custom ontologies.
        </Card>
      </>
    )
  )
}

function BasicUsage() {
  return (
    <Text>
      <h2>Basic Usage</h2>

      <Alert icon={<IconAlertCircle size={16} />} title="Account required">
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
        To setup a basic annotation session, you need to:

        <ol>
          <li>Create a workspace</li>
          <li>Setup a config</li>
          <li>Upload documents</li>
          <li>Add your annotations 🥳</li>
        </ol>
      </Text>

      Ready? Let's get started!
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

function SetupConfig() {
  return (
    <Text>
      <h2>Setup a config</h2>

      <Alert icon={<IconAlertCircle size={16} />} title="Don't have a config?">
        <Group>
          <Text>
            If you don't have a config, you can create one on the workspace setup
            page by clicking <b>Create config</b> and following the instructions.
          </Text>
        </Group>
      </Alert>

      <br />

      <Text>
        To add an existing config:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Add config</b></li>
          <li>Upload your config</li>
        </ol>
      </Text>

      <Text>
        After creating or uploading a config, you can make changes by clicking <b>Edit config</b>.
      </Text>

      <br />

      <Text>
        Under the hood, configs are JSON files in the following format:
      </Text>

      <br />

      <Code block>
{`{
  "entities": [
    {
      "name": "Company",
      "attributes": [
        {
          "name": "Name",
          "values": [
            "Apple",
            "Google",
            "Microsoft"
          ],
          "allowCustomValues": true
        },
        {
          "name": "Location",
          "values": [
            "California",
            "New York",
            "Washington"
          ],
          "allowCustomValues": false
        }
      ]
    }
  ],
  "globalAttributes": [
    {
      "name": "Date",
      "values": [],
      "allowCustomValues": true
    }
  ]
}`}
      </Code>
    </Text>
  )
}

function UploadDocuments() {
  return (
    <Text>
      <h2>Upload documents</h2>

      <Alert icon={<IconAlertCircle size={16} />} title="File format" color="orange">
        <Group>
          <Text>
            Markup currently only supports plain text (.txt) files. We're working on adding support for
            other file formats (e.g. .pdf, .docx).
          </Text>
        </Group>
      </Alert>

      <br />

      <Text>
        To upload documents:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Add documents</b></li>
          <li>Select one or more documents</li>
        </ol>
      </Text>
    </Text>
  )
}

function AddAnnotation() {
  return (
    <Text>
      <h2>Add an annotation</h2>

      <Text>
        To add an annotation to a document:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Annotate</b></li>
          <li>Highlight the span of text you want to annotate within the document</li>
          <li>Select the entity you want to annotate the span of text with</li>
          <li>Optionally, select the attributes you want to annotate the span of text with</li>
          <li>Click <b>Add annotation</b></li>
        </ol>
      </Text>
    </Text>
  )
}

function AdditionalFeatures() {
  return (
    <Text>
      <h2>Additional features</h2>

      <Text>
        There are numerous additional features that Markup offers to make your annotation experience
        as seamless as possible, including the use of GPT-3.5 for AI-assisted annotation, the
        ability to add collaborators and define annotation guidelines for each workspace, and more.
      </Text>
    </Text>
  )
}

function AssistedAnnotation() {
  return (
    <Text>
      <h2>AI-assisted annotation</h2>

      <Text>
        Each time you highlight a span of text during an annotation session, Markup will
        automatically suggest the most relevant entity and attributes for that span.

        Clicking on a suggested entity or attribute will automatically add it to your annotation,
        although you will always have the option to change it or add additional values.
      </Text>
    </Text>
  )
}

function UploadExistingAnnotations() {
  return (
    <Text>
      <h2>Upload existing annotations</h2>

      <Text>
        To upload existing annotations for a single document:

        <ol>
          <li>Open your workspace</li>
          <li>Click the annotation icon (<IconFilePlus size={16} color="#acf2fa" />) next to the target document</li>
          <li>Upload your annotations</li>
        </ol>
      </Text>

      <Text>
        To upload existing annotations for multiple documents:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Upload annotations</b></li>
          <li>Upload your annotations</li>
        </ol>

        The name of each annotation file must match the name of the corresponding document file, other than the file extension.
        For example, if you have a document named <b>document1.txt</b>, the corresponding annotation file must be
        named <b>document1.json</b> in order for Markup to match the two files.
      </Text>

      <br />

      <Text>
        Annotations must be JSON files in the following format:

        <br />
        <br />

        <Code block>
{`[
  {
    "entity": "Patient",
    "start_index": 353,
    "end_index": 387,
    "text": "temporal lobe onset focal seizures",
    "attributes": {
      "Date": "2021-01-01"
    }
  }
]`}
        </Code>
      </Text>
    </Text>
  )
}

function SetAnnotationGuidelines() {
  return (
    <Text>
      <h2>Set annotation guidelines</h2>

      <Text>
        To set annotation guidelines:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Add guidelines</b></li>
          <li>Upload your guidelines</li>
        </ol>
      </Text>

      Currently, guidelines must be plain text (.txt) files.
    </Text>
  )
}


function AddOntology() {
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
{`[
  {
    "code": "1",
    "name": "flu"
  },
  {
    "code": "2",
    "name": "paracetamol"
  }
]`}
        </Code>
      </Text>
    </Text>
  )
}

function SearchDocuments() {
  return (
    <Text>
      <h2>Search document</h2>

      <Text>
        During an annotation session, you can search for a document by name by
        clicking <b>Search documents</b>. Currently this only does a basic search
        of document content, but we plan to add more advanced search capabilities such
        as the ability to perform semantic searches and search by entity/attribute in
        the near future.
      </Text>
    </Text>
  )
}

function ExportAnnotations() {
  return (
    <Text>
      <h2>Export annotations</h2>

      <Text>
        To export annotations for your workspace:

        <ol>
          <li>Open your workspace</li>
          <li>Click on <b>Annotate</b></li>
          <li>Click <b>Export</b></li>
        </ol>

        Annotations will be exported as .zip file containing a .json file for each document
        in your workspace.
      </Text>
    </Text>
  )
}

function Collaborate() {
  return (
    <Text>
      <h2>Collaborate</h2>

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

export default Docs
