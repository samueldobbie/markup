// import { openTab } from "@commons/utils/Location"
// import { showErrorToast } from "@components/toast/Toast"
import { auth } from "constants/Firebase"
import { useState } from "react"
import NavBar from "./NavBar"
import NavDrawer from "./NavDrawer"

function Nav() {
  const [drawer, setDrawer] = useState(false)

  const toggleDrawer = () => {
    setDrawer(!drawer)
  }

  const openDocs = () => {
    // openTab(Page.docs.path)
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
