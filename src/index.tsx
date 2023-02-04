import { RecoilRoot, useRecoilState } from "recoil"
import { AuthProvider } from "providers/AuthProvider"
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core"
import { BrowserRouter } from "react-router-dom"
import PageRoutes from "components/routes/PageRoutes"
import { ModalsProvider } from "@mantine/modals"
import { NotificationsProvider } from "@mantine/notifications"
import { themeState } from "storage/state"
import Navbar from "components/nav/NavBar"
import ReactDOM from "react-dom/client"
import "./index.css"

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
            ],
          },
          primaryShade: 4,
        }}
      >
        <NotificationsProvider>
          <ModalsProvider>
            <AuthProvider>
              <BrowserRouter>
                <Navbar />
                <PageRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider >
  )
}

const container = document.getElementById("root") as HTMLElement
const root = ReactDOM.createRoot(container)

root.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>
)
