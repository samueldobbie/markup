import { Internal } from "constants/Page"
import ForgotPassword from "pages/auth/ForgotPassword"
import SignIn from "pages/auth/SignIn"
import SignUp from "pages/auth/SignUp"
import Home from "pages/home/Home"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import PrivateRoute from "./PrivateRoute"
import PublicRoute from "./PublicRoute"

function PageRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={Internal.home.path}
          element={
            <PublicRoute title={Internal.home.title}>
              <Home />
            </PublicRoute>
          }
        />

        <Route
          path={Internal.auth.signUp.path}
          element={
            <PublicRoute
              mustBeSignedOut
              title={Internal.auth.signUp.title}
            >
              <SignUp />
            </PublicRoute>
          }
        />

        <Route
          path={Internal.auth.signIn.path}
          element={
            <PublicRoute
              mustBeSignedOut
              title={Internal.auth.signIn.title}
            >
              <SignIn />
            </PublicRoute>
          }
        />

        <Route
          path={Internal.auth.forgotPassword.path}
          element={
            <PublicRoute
              mustBeSignedOut
              title={Internal.auth.forgotPassword.title}
            >
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path={Internal.dashboard.path}
          element={
            <PrivateRoute title={Internal.dashboard.title}>
              <ForgotPassword />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default PageRoutes
