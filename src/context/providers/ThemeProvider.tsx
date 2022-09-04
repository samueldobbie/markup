import ThemeMode from "constants/Theme"
import { Theme, ThemeProvider } from "@emotion/react"
import { createTheme } from "@mui/material"
import { themeModeState } from "context/store/Theme"
import { useRecoilValue } from "recoil"

function MarkupThemeProvider({ children }: any): JSX.Element {
  const themeMode = useRecoilValue(themeModeState)
  const theme = buildTheme(themeMode)

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

function buildTheme(themeMode: string): Theme {
  const common = getCommonConfigs()
  const components = getComponentConfigs()
  const palette = themeMode == ThemeMode.Light
    ? getLightPalette()
    : getDarkPalette()

  return createTheme({
    ...common,
    ...components,
    ...palette,
  })
}

function getCommonConfigs(): any {
  return {
    typography: {
      fontFamily: "Inter, sans-serif",
      button: {
        textTransform: "none",
      },
      text: {
        lineHeight: 1.5,
      },
    },
  }
}

function getComponentConfigs(): any {
  return {
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            "&:not(:last-child)": {
              borderBottom: 0,
            },
            "&:before": {
              display: "none",
            },
            "&.Mui-expanded": {
              marginBottom: 20
            },
            "&:hover": {
              filter: "brightness(0.98)",
            },
          }
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(0, 0, 0, .03)",
            marginBottom: -1,
            minHeight: 56,
            "&$expanded": {
              minHeight: 56,
            },
          },
          content: {
            "&$expanded": {
              margin: "12px 0",
            },
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            paddingTop: 16,
          },
        },
      },
    },
  }
}

function getDarkPalette(): any {
  return {
    palette: {
      type: ThemeMode.Dark,
      primary: {
        main: "rgb(123, 128, 255)",
      },
      secondary: {
        main: "rgb(17, 19, 24)",
      },
      background: {
        default: "rgb(30, 33, 42)",
        paper: "rgb(37, 41, 53)",
      },
      text: {
        primary: "rgb(216, 218, 222)",
        secondary: "rgb(134, 137, 152)",
      },
    },
  }
}

function getLightPalette(): any {
  return {
    palette: {
      type: ThemeMode.Light,
      primary: {
        main: "rgb(123, 128, 255)",
      },
      secondary: {
        main: "rgb(17, 19, 24)",
      },
      background: {
        default: "#F1F1F1",
        paper: "#ededed",
      },
    },
  }
}

export { MarkupThemeProvider }
