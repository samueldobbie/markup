// import { getComparator } from "@commons/utils/Sort"
import { TableContainer } from "@mui/material"
import Checkbox from "@mui/material/Checkbox"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import TableBox from "components/table/TableBox"
import TablePlaceholder from "components/table/TablePlaceholder"
import { dashboardOntologyPageState, dashboardOntologySelectedState, dashboardOntologyOrderState, dashboardOntologyState } from "context/store/Dashboard"
import { ChangeEvent } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import OntologyTableHead from "./OntologyTableHead"
import OntologyTableToolbar from "./OntologyTableToolbar"

function OntologyTable(): JSX.Element {
  const [page, setPage] = useRecoilState(dashboardOntologyPageState)
  const [selected, setSelected] = useRecoilState(dashboardOntologySelectedState)
  
  const order = useRecoilValue(dashboardOntologyOrderState)
  const ontologies = useRecoilValue(dashboardOntologyState)
  const emptyRows = page.active > 0 ? Math.max(0, (1 + page.active) * page.rows - ontologies.length) : 0

  const handleSelectOntology = (id: string) => {
    const selectedIndex = selected.indexOf(id)
    const updatedSelected = selected.slice()

    if (selectedIndex === -1) {
      updatedSelected.push(id)
    } else {
      updatedSelected.splice(selectedIndex, 1)
    }

    setSelected(updatedSelected)
  }

  const isSelected = (id: string) => {
    return selected.indexOf(id) !== -1
  }

  const handleChangePage = (updatedPage: number) => {
    setPage({
      active: updatedPage,
      rows: page.rows,
    })
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setPage({
      active: 0,
      rows: parseInt(event.target.value),
    })
  }

  return (
    <TableBox>
      <OntologyTableToolbar
        ontologyCount={ontologies.length}
      />

      {ontologies.length == 0 && (
        <TablePlaceholder>
          Add an ontology to map terms during annotation
        </TablePlaceholder>
      )}

      {ontologies.length > 0 && (
        <>
          <TableContainer>
            <OntologyTableHead />

            <TableBody>
              {ontologies.slice() // .sort(getComparator(order.direction, order.property))
                .slice(page.active * page.rows, page.active * page.rows + page.rows)
                .map((row) => {
                  const isItemSelected = isSelected(row.id)

                  return (
                    <TableRow
                      hover
                      onClick={() => handleSelectOntology(row.id)}
                      role="checkbox"
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                        />
                      </TableCell>

                      <TableCell
                        component="th"
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
                    </TableRow>
                  )
                })}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </TableContainer>

          <TablePagination
            component="div"
            page={page.active}
            count={ontologies.length}
            rowsPerPage={page.rows}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, p) => handleChangePage(p)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </TableBox>
  )
}

export default OntologyTable
