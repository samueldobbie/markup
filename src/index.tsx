import React from "react"
import ReactDOM from "react-dom/client"
import { RecoilRoot } from "recoil"
import { MarkupThemeProvider } from "context/providers/ThemeProvider"
import { CssBaseline } from "@mui/material"
import PageRoutes from "components/routes/PageRoutes"
import Nav from "components/nav/Nav"
import { HelmetProvider } from "react-helmet-async"
import "./index.css"
import { AuthProvider } from "context/providers/AuthProvider"

function App(): JSX.Element {
  return (
    <React.StrictMode>
      <RecoilRoot>
        <AuthProvider>
          <MarkupThemeProvider>
            <HelmetProvider>
              <CssBaseline />
              <Nav />
              <PageRoutes />
            </HelmetProvider>
          </MarkupThemeProvider>
        </AuthProvider>
      </RecoilRoot>
    </React.StrictMode>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(<App />)
