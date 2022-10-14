import ForgotPassword from "pages/auth/ForgotPassword"
import SignIn from "pages/auth/SignIn"
import SignUp from "pages/auth/SignUp"
import { Route, Routes } from "react-router-dom"
import UnprotectedRoute from "./UnprotectedRoute"
import { Path } from "utils/Path"
import Home2 from "pages/home/Home"
import NotFound from "pages/error/NotFound"

function PageRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path={Path.Home} element={<Home2 />} />

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

      <Route path={Path.NotFound} element={<NotFound />} />
    </Routes>
  )
}

export default PageRoutes
