import { LoadingButton } from "@mui/lab"

interface Props {
  loading: boolean
  buttonText: string
}

function SubmitButton(props: Props): JSX.Element {
  const { loading, buttonText } = props

  const loadingButtonStyles = {
    marginTop: 3,
    marginBottom: 3,
    fontWeight: "bold",
  }
  
  return (
    <LoadingButton
      fullWidth
      loading={loading}
      type="submit"
      variant="contained"
      color="primary"
      sx={loadingButtonStyles}
    >
      {buttonText}
    </LoadingButton>
  )
}

export default SubmitButton
