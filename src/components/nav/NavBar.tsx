import Page from "constants/Page"
import ThemeMode from "constants/Theme"
import ExpandMoreTwoToneIcon from "@mui/icons-material/ExpandMoreTwoTone"
import MenuTwoToneIcon from "@mui/icons-material/MenuTwoTone"
import NightsStayTwoToneIcon from "@mui/icons-material/NightsStayTwoTone"
import WbSunnyTwoToneIcon from "@mui/icons-material/WbSunnyTwoTone"
import { AppBar, Button, Container, Divider, Hidden, IconButton, Link, Menu, MenuItem, Toolbar } from "@mui/material"
import { userState } from "context/store/Auth"
import { themeModeSelector, themeModeState } from "context/store/Theme"
import { useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import NavLogo from "./NavLogo"
import RepoButton from "./RepoButton"

interface Props {
  toggleDrawer: () => void
  openDocs: () => void
  handleLogout: () => void
}

function NavBar(props: Props) {
  const { toggleDrawer, openDocs, handleLogout } = props
  
  const [anchor, setAnchor] = useState(null)
  
  const open = Boolean(anchor)
  const user = useRecoilValue(userState)
  const themeMode = useRecoilValue(themeModeState)
  const themeModeToggle = useSetRecoilState(themeModeSelector)

  const buttonStyles = {
    color: "text.primary",
    fontSize: "1.02rem",
    mr: 1,
  }

  const iconButtonStyles = {
    color: "text.primary",
    opacity: 0.6,
  }

  const repoButtonStyles = {
    color: "transparent",
    backgroundColor: "transparent",
    marginTop: 1,
    ml: 2,
    cursor: "default",
    "&:hover": {
      backgroundColor: "transparent",
    },
  }

  const handleDropdownClick = (event: any) => {
    setAnchor(event.currentTarget)
  }

  const handleClose = () => {
    setAnchor(null)
  }

  const signedInButtons = () => {
    return (
      <>
        <Button
          onClick={handleDropdownClick}
          sx={buttonStyles}
        >
          Account <ExpandMoreTwoToneIcon />
        </Button>

        <Menu
          open={open}
          anchorEl={anchor}
          onClose={handleClose}
          onClick={handleClose}
        >
          <MenuItem
            component={Link}
            href={Page.dashboard.path}
          >
            Dashboard
          </MenuItem>

          <MenuItem
            component={Link}
            href={Page.dashboard.path}
          >
            Settings
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            Log Out
          </MenuItem>
        </Menu>
      </>
    )
  }

  const signedOutButtons = () => {
    return (
      <>
        <Button
          component={Link}
          href={Page.dashboard.path}
          sx={buttonStyles}
        >
          Sign In
        </Button>

        <Button
          component={Link}
          href={Page.dashboard.path}
          sx={buttonStyles}
        >
          Sign Up
        </Button>
      </>
    )
  }

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
    >
      <Container disableGutters>
        <Toolbar>
          <NavLogo />

          <div style={{ flexGrow: 1 }} />

          <Hidden smUp>
            <IconButton
              onClick={toggleDrawer}
              sx={iconButtonStyles}
            >
              <MenuTwoToneIcon />
            </IconButton>
          </Hidden>

          <Hidden smDown>
            <Button
              onClick={openDocs}
              sx={buttonStyles}
            >
              Docs
            </Button>

            {
              user
                ? signedInButtons()
                : signedOutButtons()
            }

            <IconButton
              onClick={themeModeToggle}
              sx={iconButtonStyles}
            >
              {
                themeMode === ThemeMode.Light
                  ? <NightsStayTwoToneIcon />
                  : <WbSunnyTwoToneIcon />
              }
            </IconButton>

            <Button sx={repoButtonStyles}>
              <RepoButton />
            </Button>
          </Hidden>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default NavBar
