import { firestore } from "constants/Firebase"
import { Internal } from "constants/Page"
import { Collection } from "constants/Collection"
import { moveToPage } from "utils/Location" // readFiles
// import { parseOntologyItems } from "@commons/utils/parser"
// import { showErrorToast } from "@components/toast/Toast"
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone"
import { Button, Zoom } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import { alpha, Theme } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
// import { userIdState } from "@store/auth/Auth"
// import { dashboardOntologySelectedState, dashboardOntologyState } from "@store/dashboard/DashboardOntologyTable"
// import { dashboardStepState } from "@store/dashboard/DashboardSteps"
import { useRecoilRefresher_UNSTABLE, useRecoilState, useRecoilValue } from "recoil"
import { dashboardOntologySelectedState, dashboardOntologyState, dashboardStepState } from "context/store/Dashboard"
import { userIdState } from "context/store/Auth"

interface Props {
  ontologyCount: number
}

function OntologyTableToolbar(props: Props): JSX.Element {
  const { ontologyCount } = props

  const [selected, setSelected] = useRecoilState(dashboardOntologySelectedState)
  const [checkedSteps, setCheckedSteps] = useRecoilState(dashboardStepState)

  const userId = useRecoilValue(userIdState)
  const refreshOntologies = useRecoilRefresher_UNSTABLE(dashboardOntologyState)

  const toolbarStyles = {
    pl: { sm: 2 },
    pr: { xs: 1, sm: 1 },
    ...(selected.length > 0 && {
      bgcolor: (theme: Theme) =>
        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
    }),
  }

  const uploadOntology = (input: HTMLInputElement) => {
    if (input.files) {
      // readFiles(input.files)
      //   .then((files) => {
      //     if (files.length > 0) {
      //       const file = files[0]
      //       const content = parseOntologyItems(file.content)

      //       if (content.length > 0) {
      //         let isDuplicateName = false

      //         db
      //           .collection(Collection.User)
      //           .doc(userId)
      //           .collection(Collection.Ontology)
      //           .get()
      //           .then((result) => {
      //             result.forEach((item) => {
      //               const data = item.data()
                    
      //               if (data.name === file.name) {
      //                 isDuplicateName = true
      //               }
      //             })
      //           })
      //           .then(() => {
      //             if (isDuplicateName) {
      //               showErrorToast("An ontology with that file name already exists")
      //             } else {
      //               const data = {
      //                 name: file.name,
      //                 content: content,
      //               }
      
      //               db
      //                 .collection(Collection.User)
      //                 .doc(userId)
      //                 .collection(Collection.Ontology)
      //                 .add(data)
      //                 .then(() => {
      //                   refreshOntologies()

      //                   setCheckedSteps({
      //                     ...checkedSteps,
      //                     addedOntology: true,
      //                   })
      //                 })
      //             }
      //           })
      //       } else {
      //         showErrorToast("Ontology contains no items. Please read the documentation to ensure it's formatted correctly.")
      //       }            
      //     }
      //   })
    }
  }

  const handleDeleteOntologies = () => {
    // const batch = db.batch()

    // selected.forEach(id => {
    //   const doc = db
    //     .collection(Collection.User)
    //     .doc(userId)
    //     .collection(Collection.Ontology)
    //     .doc(id)

    //   batch.delete(doc)
    // })

    // batch
    //   .commit()
    //   .finally(() => {
    //     setSelected([])
    //     refreshOntologies()
    //   })
  }

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
            Ontologies ({ontologyCount})
          </Typography>

          <Button
            onClick={() => moveToPage("Page.Client.Explore.path")}
            variant="contained"
            size="medium"
            color="primary"
            component="label"
            sx={{ mr: 1 }}
          >
            Explore
          </Button>

          <Button
            variant="contained"
            size="medium"
            color="primary"
            component="label"
          >
            Add Ontology
            <input
              type="file"
              accept=".txt"
              onChange={(e) => uploadOntology(e.target)}
              hidden
            />
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
            <IconButton onClick={handleDeleteOntologies}>
              <DeleteTwoToneIcon color="primary" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  )
}

export default OntologyTableToolbar
