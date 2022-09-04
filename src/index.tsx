import React from "react"
import ReactDOM from "react-dom/client"
import { RecoilRoot } from "recoil"
import { MarkupThemeProvider } from "context/providers/ThemeProvider"
import { CssBaseline } from "@mui/material"
import PageRoutes from "components/routes/PageRoutes"
import Nav from "components/nav/Nav"
import { HelmetProvider } from "react-helmet-async"
import "./index.css"

function App(): JSX.Element {
  return (
    <React.StrictMode>
      <RecoilRoot>
        <HelmetProvider>
          <MarkupThemeProvider>
            <CssBaseline />
            <Nav />
            <PageRoutes />
          </MarkupThemeProvider>
        </HelmetProvider>
      </RecoilRoot>
    </React.StrictMode>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(<App />)
