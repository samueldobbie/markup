import { Box, Paper } from "@mui/material"

function TableBox({children}: any): JSX.Element {
  const containerStyles = {
    width: "100%",
    userSelect: "none",
  }

  const paperStyles = {
    width: "100%",
  }

  return (
    <Box sx={containerStyles}>
      <Paper sx={paperStyles}>
        {children}
      </Paper>
    </Box>
  )
}

export default TableBox
