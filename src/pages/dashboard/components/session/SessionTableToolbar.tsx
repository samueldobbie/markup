import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone"
import { Button, Zoom } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import { alpha, Theme } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { AuthState, DashboardStore } from "context/store"
import { useModal } from "mui-modal-provider"
import { useEffect } from "react"
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue } from "recoil"
import CreateSessionDialog from "./CreateSessionDialog"

interface Props {
  sessionCount: number
}

function SessionTableToolbar(props: Props): JSX.Element {
  const { sessionCount } = props
  const { showModal } = useModal()

  const [userId, setUserId] = useRecoilState(AuthState.userIdState)
  const [selected, setSelected] = useRecoilState(DashboardStore.sessionTableSelected)
  const [tutorialProgress, setTutorialProgress] = useRecoilState(DashboardStore.tutorialProgress)

  const user = useRecoilValue(AuthState.user)
  const refreshSessions = useRecoilRefresher_UNSTABLE(DashboardStore.sessionTableSessions)

  const toolbarStyles = {
    pl: { sm: 2 },
    pr: { xs: 1, sm: 1 },
    ...(selected.length > 0 && {
      bgcolor: (theme: Theme) =>
        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
    }),
  }

  const handleCreateSession = () => {
    const dialogProps = {
      onConfirm: () => {
        modal.hide()

        refreshSessions()

        setTutorialProgress({
          ...tutorialProgress,
          createdSession: true,
        })
      },
    }

    const modal = showModal(CreateSessionDialog, dialogProps)
  }

  const handleDeleteSessions = () => {
    const batch = db.batch()

    selected.forEach(id => {
      const doc = db
        .collection(Collection.User)
        .doc(userId)
        .collection(Collection.Session)
        .doc(id)

      batch.delete(doc)
    })

    batch
      .commit()
      .finally(() => {
        setSelected([])
        refreshSessions()
      })
  }

  useEffect(() => {
    if (user && user.uid) {
      setUserId(user.uid)
    }
  }, [])

  return (
    <Toolbar sx={toolbarStyles}>
      {selected.length == 0 && (
        <>
          <Typography
            sx={{ flex: "1 1" }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Active Sessions ({sessionCount})
          </Typography>
        
          <Button
            variant="contained"
            size="medium"
            color="primary"
            onClick={handleCreateSession}
            sx={{ mr: 1 }}
          >
            New Session
          </Button>
        </>
      )}

      {selected.length > 0 && (
        <>
          <Typography
            color="inherit"
            variant="subtitle1"
            component="div"
            sx={{ flex: "1 1 100%" }}
          >
            {selected.length} selected
          </Typography>
        
          <Tooltip
            arrow
            title="Delete"
            placement="top"
            TransitionComponent={Zoom}
          >
            <IconButton onClick={handleDeleteSessions}>
              <DeleteTwoToneIcon color="primary" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  )
}

export default SessionTableToolbar
