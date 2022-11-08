import React from "react"
import ReactDOM from "react-dom/client"
import { RecoilRoot, useRecoilState } from "recoil"
import { AuthProvider } from "providers/AuthProvider"
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core"
import { themeState } from "store/Theme"
import { BrowserRouter } from "react-router-dom"
import Navbar from "components/nav/Navbar"
import PageRoutes from "components/routes/PageRoutes"
import { ModalsProvider } from "@mantine/modals"

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
            brand: [
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
            ],
            dark: [
              "#F8F9F9",
              "#B1B3B7",
              "#7C7F89",
              "#585B65",
              "#3E414B",
              "#2C2F38",
              "#1E212A",
              "#141519",
              "#0D0D0F",
              "#080809",
            ]
          },
          primaryShade: {
            light: 4,
            dark: 4,
          },
        }}
      >
        <ModalsProvider>
          <AuthProvider>
            <BrowserRouter>
              <Navbar />
              <PageRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider >
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
