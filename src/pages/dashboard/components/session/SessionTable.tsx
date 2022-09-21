import BuildCircleTwoToneIcon from "@mui/icons-material/BuildCircleTwoTone"
import PlayCircleFilledTwoToneIcon from "@mui/icons-material/PlayCircleFilledTwoTone"
import { IconButton, Tooltip, Zoom } from "@mui/material"
import Checkbox from "@mui/material/Checkbox"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import TableBox from "components/table/TableBox"
import TableContainer from "components/table/TableContainer"
import TablePlaceholder from "components/table/TablePlaceholder"
import { DashboardStore } from "context/store/Dashboard"
import { ChangeEvent } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { moveToPage } from "utils/Location"
import { getComparator } from "utils/Sort"

import SessionTableHead from "./SessionTableHead"
import SessionTableToolbar from "./SessionTableToolbar"

function SessionTable(): JSX.Element {
  const [page, setPage] = useRecoilState(DashboardStore.sessionTablePage)
  const [selected, setSelected] = useRecoilState(DashboardStore.sessionTableSelected)

  const order = useRecoilValue(DashboardStore.sessionTableOrder)
  const sessions = useRecoilValue(DashboardStore.sessionTableSessions)
  const emptyRows = page.active > 0 ? Math.max(0, (1 + page.active) * page.rows - sessions.length) : 0

  const handleSelectSession = (id: string) => {
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

  const moveToSetup = (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
    
    // const path = buildSessionSetupPath(id)
    const path = id
    moveToPage(path)
  }

  const moveToSession = (event: React.MouseEvent, id: string) => {
    event.stopPropagation()

    // const path = buildSessionAnnotatePath(id)
    const path = id
    moveToPage(path)
  }

  return (
    <TableBox>
      <SessionTableToolbar
        sessionCount={sessions.length}
      />

      {sessions.length == 0 && (
        <TablePlaceholder>
          Create a session to start annotating
        </TablePlaceholder>
      )}

      {sessions.length > 0 && (
        <>
          <TableContainer>
            <SessionTableHead />

            <TableBody>
              {sessions.slice().sort(getComparator(order.direction, order.property))
                .slice(page.active * page.rows, page.active * page.rows + page.rows)
                .map((row) => {
                  const isItemSelected = isSelected(row.id)

                  return (
                    <TableRow
                      hover
                      onClick={() => handleSelectSession(row.id)}
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

                      <TableCell align="right">
                        <Tooltip 
                          arrow
                          title="Configure"
                          placement="top"
                          TransitionComponent={Zoom}
                        >
                          <IconButton onClick={(e) => moveToSetup(e, row.id)}>
                            <BuildCircleTwoToneIcon color="primary" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          arrow
                          title="Annotate"
                          placement="top"
                          TransitionComponent={Zoom}
                        >
                          <IconButton
                            onClick={(e) => moveToSession(e, row.id)}
                            disabled={!row.ready}
                            sx={{ opacity: row.ready ? 1 : 0.5 }}
                          >
                            <PlayCircleFilledTwoToneIcon color="primary" />
                          </IconButton>
                        </Tooltip>
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
            count={sessions.length}
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

export default SessionTable
