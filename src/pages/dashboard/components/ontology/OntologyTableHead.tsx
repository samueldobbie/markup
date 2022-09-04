import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableSortLabel from "@mui/material/TableSortLabel"
import { visuallyHidden } from "@mui/utils"
import { ITableData } from "constants/Table"
import { dashboardOntologyOrderState, dashboardOntologySelectedState, dashboardOntologyState } from "context/store/Dashboard"
import { ChangeEvent } from "react"
import { useRecoilState, useRecoilValue } from "recoil"

interface HeadCell {
  id: keyof ITableData
  label: string
  numeric: boolean
  disablePadding: boolean
}

const headCells: HeadCell[] = [
  {
    id: "name",
    label: "Name",
    numeric: false,
    disablePadding: false,
  },
]

function OntologyTableHead(): JSX.Element {
  const [order, setOrder] = useRecoilState(dashboardOntologyOrderState)
  const [selected, setSelected] = useRecoilState(dashboardOntologySelectedState)

  const ontologies = useRecoilValue(dashboardOntologyState)

  const handleRequestSort = (property: keyof ITableData) => {
    // const isAsc =
    //   order.property === property &&
    //   order.direction === "asc"

    // const direction = isAsc
    //   ? "desc"
    //   : "asc"

    // setOrder({
    //   direction,
    //   property,
    // })
  }

  const handleSelectAllOntologies = (event: ChangeEvent<HTMLInputElement>) => {
    // if (event.target.checked) {
    //   const updatedSelected = ontologies.map((n) => n.id)
    //   setSelected(updatedSelected)
    // } else {
    //   setSelected([])
    // }
  }

  const createSortHandler = (property: keyof ITableData) => () => {
    handleRequestSort(property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={selected.length > 0 && selected.length < ontologies.length}
            checked={ontologies.length > 0 && selected.length === ontologies.length}
            onChange={handleSelectAllOntologies}
          />
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={order.property === headCell.id ? order.direction : false}
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <TableSortLabel
              active={order.property === headCell.id}
              direction={order.property === headCell.id ? order.direction : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}

              {order.property == headCell.id && (
                <Box component="span" sx={visuallyHidden}>
                  {
                    order.direction === "desc"
                      ? "sorted descending"
                      : "sorted ascending"
                  }
                </Box>
              )}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

export default OntologyTableHead
