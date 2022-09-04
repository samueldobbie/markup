import Page from "constants/Page"
import { Divider, Drawer, Link, List, ListItem, ListItemText } from "@mui/material"
import { userState } from "context/store/Auth"
import { themeModeSelector } from "context/store/Theme"
import { useRecoilValue, useSetRecoilState } from "recoil"
import RepoButton from "./RepoButton"

interface Props {
  drawer: boolean
  toggleDrawer: () => void
  openDocs: () => void
  handleLogout: () => void
}

function NavDrawer(props: Props): JSX.Element {
  const {
    drawer,
    toggleDrawer,
    openDocs,
    handleLogout,
  } = props

  const user = useRecoilValue(userState)
  const themeModeToggle = useSetRecoilState(themeModeSelector)

  const signedOutListItems = () => {
    return (
      <>
        <ListItem
          button
          component={Link}
          href={Page.dashboard.path}
        >
          <ListItemText>
            Sign In
          </ListItemText>
        </ListItem>

        <ListItem
          button
          component={Link}
          href={Page.dashboard.path}
        >
          <ListItemText>
            Sign Up
          </ListItemText>
        </ListItem>
      </>
    )
  }

  const signedInListItems = () => {
    return (
      <>
        <ListItem
          button
          component={Link}
          href={Page.dashboard.path}
        >
          <ListItemText>
            Dashboard
          </ListItemText>
        </ListItem>

        <ListItem
          button
          component={Link}
          href={Page.dashboard.path}
        >
          <ListItemText>
            Settings
          </ListItemText>
        </ListItem>

        <Divider />

        <ListItem
          button
          onClick={handleLogout}
        >
          <ListItemText>
            Sign out
          </ListItemText>
        </ListItem>
      </>
    )
  }

  return (
    <Drawer
      anchor="right"
      open={drawer}
      onClose={toggleDrawer}
    >
      <List sx={{ width: 250 }}>
        <ListItem button onClick={openDocs}>
          <ListItemText>
            Docs
          </ListItemText>
        </ListItem>

        {
          user
            ? signedInListItems()
            : signedOutListItems()
        }

        <ListItem button onClick={themeModeToggle}>
          <ListItemText>
            Toggle Theme
          </ListItemText>
        </ListItem>

        <ListItem>
          <RepoButton />
        </ListItem>
      </List>
    </Drawer>
  )
}

export default NavDrawer
