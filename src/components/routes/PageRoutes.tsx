import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicRoute from "./PublicRoute"

function PageRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={
            <PublicRoute title="Home - Markup">

            </PublicRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default PageRoutes
