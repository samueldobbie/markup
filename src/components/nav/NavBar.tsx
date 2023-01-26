import { createStyles, Header, Container, Group, Burger, Paper, Transition, Switch, useMantineTheme, useMantineColorScheme, Image, Center, Menu, Divider } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Link } from "react-router-dom"
import { IconSun, IconMoonStars, IconChevronDown } from "@tabler/icons"
import { useAuth } from "providers/AuthProvider"
import { Path } from "utils/Path"
import GitHubButton from "react-github-btn"
import { supabase } from "utils/Supabase"

const HEADER_HEIGHT = 60

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 10,
  },
  dropdown: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  navItems: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
  navItem: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },

    "&:focus, &:hover, &:visited, &:link, &:active": {
      textDecoration: "none",
    }
  },
  navItemHover: {
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
    },
  },
}))

function Navbar(): JSX.Element {
  const theme = useMantineTheme()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const { classes, cx } = useStyles()
  const { user } = useAuth()
  const [opened, { toggle, close }] = useDisclosure(false)

  const logo = theme.colorScheme === "dark"
    ? "https://i.imgur.com/XNjFxxn.png"
    : "https://i.imgur.com/9Q9lBeF.png"

  const navbarItems = (
    <>
      <Link
        to={Path.Docs}
        className={cx(classes.navItem, classes.navItemHover)}
        onClick={() => close()}
      >
        Docs
      </Link>

      {user === null &&
        <>
          <Link
            to={Path.SignIn}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign In
          </Link>

          <Link
            to={Path.SignUp}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign Up
          </Link>
        </>
      }

      {user !== null &&
        <>
          <Menu width={200} shadow="xs">
            <Menu.Target>
              <a
                href="/"
                className={cx(classes.navItem, classes.navItemHover)}
                onClick={(event) => event.preventDefault()}
              >
                <Center>
                  <span>Account</span>
                  <IconChevronDown size={16} stroke={2} />
                </Center>
              </a>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item component="a" href={Path.Dashboard}>
                Dashboard
              </Menu.Item>

              <Menu.Item component="a" href={Path.Settings}>
                Settings
              </Menu.Item>

              <Menu.Item component="a" href={Path.Support}>
                Support
              </Menu.Item>

              <Divider />

              <Menu.Item onClick={async () => await supabase.auth.signOut()}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </>
      }

      <Switch
        checked={colorScheme === 'dark'}
        onChange={() => toggleColorScheme()}
        size="lg"
        onLabel={<IconSun color={theme.white} size={20} stroke={1.5} />}
        offLabel={<IconMoonStars color={theme.colors.gray[6]} size={20} stroke={1.5} />}
        className={cx(classes.navItem)}
      />

      <Group className={cx(classes.navItem)}>
        <GitHubButton
          href="https://github.com/samueldobbie/markup"
          data-size="large"
          data-show-count="true"
        >
          Star
        </GitHubButton>
      </Group>
    </>
  )

  const burgerMenuItems = (
    <>
      {user === null &&
        <>
          <Link
            to={Path.Docs}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Docs
          </Link>

          <Link
            to={Path.SignIn}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign In
          </Link>

          <Link
            to={Path.SignUp}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign Up
          </Link>
        </>
      }

      {user !== null &&
        <>
          <Link
            to={Path.Docs}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Docs
          </Link>

          <Link
            to={Path.Dashboard}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Dashboard
          </Link>

          <Link
            to={Path.Settings}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Settings
          </Link>

          <Link
            to={Path.Support}
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Support
          </Link>

          <span
            className={cx(classes.navItem, classes.navItemHover)}
            onClick={async () => await supabase.auth.signOut()}
          >
            Logout
          </span>
        </>
      }

      <Switch
        checked={colorScheme === 'dark'}
        onChange={() => toggleColorScheme()}
        size="lg"
        onLabel={<IconSun color={theme.white} size={20} stroke={1.5} />}
        offLabel={<IconMoonStars color={theme.colors.gray[6]} size={20} stroke={1.5} />}
        className={cx(classes.navItem)}
      />

      <Group className={cx(classes.navItem)}>
        <GitHubButton
          href="https://github.com/samueldobbie/markup"
          data-size="large"
          data-show-count="true"
        >
          Star
        </GitHubButton>
      </Group>
    </>
  )

  return (
    <Header height={HEADER_HEIGHT} mb={50} className={classes.root}>
      <Container className={classes.header}>
        <Link to={Path.Home} style={{ textDecoration: "none" }}>
          <Image src={logo} height={22} />
        </Link>

        <Group spacing={5} className={classes.navItems}>
          {navbarItems}
        </Group>

        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {burgerMenuItems}
            </Paper>
          )}
        </Transition>
      </Container>
    </Header>
  )
}

export default Navbar
