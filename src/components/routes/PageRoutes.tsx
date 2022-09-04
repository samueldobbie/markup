import Page from "constants/Page"
import ForgotPassword from "pages/auth/ForgotPassword"
import SignIn from "pages/auth/SignIn"
import SignUp from "pages/auth/SignUp"
import Home from "pages/home/Home"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicRoute from "./PublicRoute"

function PageRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={Page.home.path}
          element={
            <PublicRoute
              title={Page.home.title}
            >
              <Home />
            </PublicRoute>
          }
        />

        <Route
          path={Page.auth.signUp.path}
          element={
            <PublicRoute
              mustBeSignedOut
              title={Page.auth.signUp.title}
            >
              <SignUp />
            </PublicRoute>
          }
        />

        <Route
          path={Page.auth.signIn.path}
          element={
            <PublicRoute
              mustBeSignedOut
              title={Page.auth.signIn.title}
            >
              <SignIn />
            </PublicRoute>
          }
        />

        <Route
          path={Page.auth.forgotPassword.path}
          element={
            <PublicRoute
              mustBeSignedOut
              title={Page.auth.forgotPassword.title}
            >
              <ForgotPassword />
            </PublicRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default PageRoutes
