import ForgotPassword from "pages/auth/ForgotPassword"
import SignIn from "pages/auth/SignIn"
import SignUp from "pages/auth/SignUp"
import { Route, Routes } from "react-router-dom"
import UnprotectedRoute from "./UnprotectedRoute"
import { Path } from "utils/Path"
import Home from "pages/home/Home"
import NotFound from "pages/error/NotFound"
import Contact from "pages/support/Contact"
import Dashboard from "pages/dashboard/Dashboard"
import ProtectedRoute from "./ProtectedRoute"
import Setup from "pages/setup/Setup"

function PageRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path={Path.Home} element={<Home />} />

      <Route path={Path.SignUp} element={
        <UnprotectedRoute>
          <SignUp />
        </UnprotectedRoute>
      } />

      <Route path={Path.SignIn} element={
        <UnprotectedRoute>
          <SignIn />
        </UnprotectedRoute>
      } />

      <Route path={Path.ForgotPassword} element={
        <UnprotectedRoute>
          <ForgotPassword />
        </UnprotectedRoute>
      } />

      <Route path={Path.Dashboard} element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path={Path.Setup} element={
        <ProtectedRoute>
          <Setup />
        </ProtectedRoute>
      } />

      <Route path={Path.Contact} element={<Contact />} />

      <Route path={Path.NotFound} element={<NotFound />} />
    </Routes>
  )
}

export default PageRoutes
