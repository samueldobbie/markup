import { useState } from "react"
import { createStyles, Box, Text, Group, Container, Grid } from "@mantine/core"
import { IconListSearch } from "@tabler/icons"

const LINK_HEIGHT = 38
const INDICATOR_SIZE = 10
const INDICATOR_OFFSET = (LINK_HEIGHT - INDICATOR_SIZE) / 2

const DOCUMENTATION = [
  {
    label: "Introduction",
    link: "#introduction",
    order: 0,
    content: (
      <Text>
        <h2>Introduction</h2>

        <p>
          Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition. Markup learns as you annotate to predict and suggest complex annotations, and also provides integrated access to common and custom ontologies for concept mapping.
        </p>
      </Text>
    ),
  },
  {
    label: "Getting started",
    link: "#getting-started",
    order: 0,
    content: (
      <Text>
        <h2>Getting started</h2>

        <p>
          Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition. Markup learns as you annotate to predict and suggest complex annotations, and also provides integrated access to common and custom ontologies for concept mapping.
        </p>
      </Text>
    ),
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
      sx={(theme) => ({ paddingLeft: item.order * theme.spacing.lg })}
    >
      {item.label}
    </Box>
  ))

  return (
    <div>
      <Group mb="md">
        <IconListSearch size={18} stroke={1.5} />
        <Text>Table of contents</Text>
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
    </>
  )
}

export default Docs
