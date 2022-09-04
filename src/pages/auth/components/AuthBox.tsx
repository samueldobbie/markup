import LockTwoToneIcon from "@mui/icons-material/LockTwoTone"
import { Box, Container, Paper } from "@mui/material"

interface Props {
  children: any
}

function AuthBox(props: Props): JSX.Element {
  const paperStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    userSelect: "none",
    padding: 3,
  }

  return (
    <Box sx={{ my: "4%" }}>
      <Container component="main" maxWidth="xs">
        <Paper sx={paperStyles}>
          <LockTwoToneIcon sx={{ margin: 1 }} />

          {props.children}
        </Paper>
      </Container>
    </Box>
  )
}

export default AuthBox
