import { auth } from "constants/Firebase"
import { External } from "constants/Page"
import { useState } from "react"
import NavBar from "./NavBar"
import NavDrawer from "./NavDrawer"

function Nav() {
  const [drawer, setDrawer] = useState(false)

  const toggleDrawer = () => {
    setDrawer(!drawer)
  }

  const openDocs = () => {
    window.open(External.docs.url)
  }

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => window.location.reload())
      // .catch(() => showErrorToast("Failed to logout"))
  }

  return (
    <nav>
      <NavBar
        toggleDrawer={toggleDrawer}
        openDocs={openDocs}
        handleLogout={handleLogout}
      />

      <NavDrawer
        drawer={drawer}
        toggleDrawer={toggleDrawer}
        openDocs={openDocs}
        handleLogout={handleLogout}
      />
    </nav>
  )
}

export default Nav
