import { Box, Typography } from "@mui/material"

function TablePlaceholder({children}: any): JSX.Element {
  const styles = {
    textAlign: "center",
  }

  return (
    <Box py={5} px={3} sx={styles}>
      <Typography>
        {children}
      </Typography>
    </Box>
  )
}

export default TablePlaceholder
