import { Table, tableCellClasses, TableContainer as MuiTableContainer } from "@mui/material"

function TableContainer({children}: any): JSX.Element {
  const styles = {
    [`& .${tableCellClasses.root}`]: {
      borderBottom: "none",
    }
  }

  return (
    <MuiTableContainer>
      <Table
        size="small"
        sx={styles}
      >
        {children}
      </Table>
    </MuiTableContainer>
  )
}

export default TableContainer
