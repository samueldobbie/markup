import { Box, Container, Group, Burger, Paper, Transition, Switch, Image, Center, Menu, Divider, useComputedColorScheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Link } from "react-router-dom"
import { IconSun, IconMoonStars, IconChevronDown } from "@tabler/icons-react"
import { useAuth } from "providers/AuthProvider"
import { Path } from "utils/Path"
import GitHubButton from "react-github-btn"
import { supabase } from "utils/Supabase"
import { useThemeStore } from "storage/state"
import clsx from "clsx"
import classes from "./NavBar.module.css"

const HEADER_HEIGHT = 60

function Navbar() {
  const colorScheme = useComputedColorScheme("dark")
  const toggleColorScheme = useThemeStore((s) => s.toggleColorScheme)
  const { user } = useAuth()
  const [opened, { toggle, close }] = useDisclosure(false)

  const logo = colorScheme === "dark"
    ? "/logo-dark.svg"
    : "/logo-light.svg"

  const navbarItems = (
    <>
      <Link
        to={Path.Docs}
        className={clsx(classes.navItem, classes.navItemHover)}
        onClick={() => close()}
      >
        Docs
      </Link>

      {user === null &&
        <>
          <Link
            to={Path.SignIn}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign In
          </Link>

          <Link
            to={Path.SignUp}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign Up
          </Link>

          <Link
            to={Path.Support}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Support
          </Link>
        </>
      }

      {user !== null &&
        <>
          <Link
            to={Path.Dashboard}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Dashboard
          </Link>

          <Menu width={200} shadow="xs">
            <Menu.Target>
              <a
                href="/"
                className={clsx(classes.navItem, classes.navItemHover)}
                onClick={(event) => event.preventDefault()}
              >
                <Center>
                  <span>Account</span>
                  <IconChevronDown size={16} stroke={2} />
                </Center>
              </a>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item component="a" href={Path.Settings}>
                Settings
              </Menu.Item>

              <Menu.Item component="a" href={Path.Support}>
                Support
              </Menu.Item>

              <Menu.Item component="a" href={Path.Faq}>
                FAQ
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
        checked={colorScheme === "dark"}
        onChange={() => toggleColorScheme()}
        size="lg"
        onLabel={<IconSun color="white" size={20} stroke={1.5} />}
        offLabel={<IconMoonStars color="gray" size={20} stroke={1.5} />}
        className={classes.navItem}
      />

      <Group className={classes.navItem}>
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
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Docs
          </Link>

          <Link
            to={Path.SignIn}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Sign In
          </Link>

          <Link
            to={Path.SignUp}
            className={clsx(classes.navItem, classes.navItemHover)}
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
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Docs
          </Link>

          <Link
            to={Path.Dashboard}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Dashboard
          </Link>

          <Link
            to={Path.Settings}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Settings
          </Link>

          <Link
            to={Path.Support}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            Support
          </Link>

          <Link
            to={Path.Faq}
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={() => close()}
          >
            FAQ
          </Link>

          <span
            className={clsx(classes.navItem, classes.navItemHover)}
            onClick={async () => {
              await supabase.auth.signOut()
              close()
            }}
          >
            Logout
          </span>
        </>
      }

      <Switch
        checked={colorScheme === "dark"}
        onChange={() => toggleColorScheme()}
        size="lg"
        onLabel={<IconSun color="white" size={20} stroke={1.5} />}
        offLabel={<IconMoonStars color="gray" size={20} stroke={1.5} />}
        className={classes.navItem}
      />

      <Group className={classes.navItem}>
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
    <Box component="header" h={HEADER_HEIGHT} mb={50} className={classes.root}>
      <Container className={classes.header}>
        <Link to={Path.Home} style={{ textDecoration: "none" }}>
          <Image src={logo} h={36} w="auto" />
        </Link>

        <Group gap={5} className={classes.navItems}>
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
    </Box>
  )
}

export default Navbar
