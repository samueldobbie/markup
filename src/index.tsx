import React from "react"
import ReactDOM from "react-dom/client"
import { RecoilRoot, useRecoilState } from "recoil"
import { AuthProvider } from "providers/AuthProvider"
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core"
import { themeState } from "store/Theme"
import { BrowserRouter } from "react-router-dom"
import Navbar from "components/nav/Navbar"
import PageRoutes from "components/routes/PageRoutes"

function App(): JSX.Element {
  const [colorScheme, setColorScheme] = useRecoilState(themeState)

  const toggleColorScheme = (value?: ColorScheme) => {
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme,
          primaryColor: "brand",
          colors: {
            "brand": [
              "#F1F1F9",
              "#D0D1F1",
              "#AAACF2",
              "#7B7FFF",
              "#6F72E9",
              "#676AD2",
              "#6164BC",
              "#5C5EA7",
              "#5C5D90",
              "#5A5B7D"
            ]
          },
          primaryShade: {
            light: 4,
            dark: 4,
          }
          // white: "#E8E8E8", 
          // black: "#1e212a",
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <PageRoutes />
          </BrowserRouter>
        </AuthProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

const container = document.getElementById("root") as HTMLElement
const root = ReactDOM.createRoot(container)

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
)
