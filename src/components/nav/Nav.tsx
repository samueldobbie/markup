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

  const handleDocs = () => {
    // openTab(Page.docs.path)
  }

  const handleLogout = () => {
    auth
      .signOut()
      // .then(() => location.reload())
      // .catch(() => showErrorToast("Failed to logout"))
  }

  return (
    <>
      <NavBar
        toggleDrawer={toggleDrawer}
        handleDocs={handleDocs}
        handleLogout={handleLogout}
      />

      <NavDrawer
        drawer={drawer}
        toggleDrawer={toggleDrawer}
        handleDocs={handleDocs}
        handleLogout={handleLogout}
      />
    </>
  )
}

export default Nav
