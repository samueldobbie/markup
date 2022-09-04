import Nav from "components/nav/Nav"
import React from "react"
import ReactDOM from "react-dom"
import { RecoilRoot } from "recoil"
import { MarkupThemeProvider } from "context/providers/ThemeProvider"
import "./index.css"

function App(): JSX.Element {
  return (
    <React.StrictMode>
      <RecoilRoot>
        <MarkupThemeProvider>
          <Nav />
        </MarkupThemeProvider>
      </RecoilRoot>
    </React.StrictMode>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
