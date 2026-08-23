import { AuthProvider } from "providers/AuthProvider"
import { createTheme, MantineProvider } from "@mantine/core"
import { BrowserRouter } from "react-router-dom"
import PageRoutes from "components/routes/PageRoutes"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { useThemeStore } from "storage/state"
import Navbar from "components/nav/NavBar"
import { createRoot } from "react-dom/client"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dropzone/styles.css"
import "mantine-datatable/styles.css"
import "./index.css"

const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 4,
  cssVariablesResolver: () => ({
    variables: {},
    light: {
      "--mantine-color-brand-light-color": "#6F72E9",
      "--mantine-primary-color-light-color": "#6F72E9",
    },
    dark: {
      "--mantine-color-brand-light-color": "#AAACF2",
      "--mantine-primary-color-light-color": "#AAACF2",
    },
  }),
  spacing: {
    xs: "10px",
    sm: "12px",
    md: "16px",
    lg: "20px",
    xl: "24px",
  },
  components: {
    ActionIcon: {
      defaultProps: {
        variant: "subtle",
        color: "brand",
      },
    },
  },
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
      "#5A5B7D",
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
})

function App() {
  const colorScheme = useThemeStore((s) => s.colorScheme)

  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={theme.cssVariablesResolver}
      defaultColorScheme="dark"
      forceColorScheme={colorScheme === "auto" ? undefined : colorScheme}
    >
      <Notifications />
      <ModalsProvider>
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <PageRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />)
