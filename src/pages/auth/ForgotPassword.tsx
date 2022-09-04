import { Grid, TextField, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import AuthBox from "./components/AuthBox"
import SubmitButton from "components/button/SubmitButton"
import { auth } from "constants/Firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { Internal } from "constants/Page"

interface Form {
  email: string
  password: string
}

function ForgotPassword(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<Form>()

  const onSubmit = (data: Form) => {
    return sendPasswordResetEmail(auth, data.email)
      // .then(() => showSuccessToast("Reset instructions have been sent to your email."))
      // .catch((error) => showErrorToast(error.message))
  }

  return (
    <AuthBox>
      <Typography gutterBottom variant="h5">
        Forgotten password
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: "100%" }}
      >
        <TextField
          autoFocus
          fullWidth
          variant="filled"
          margin="normal"
          type="email"
          label="Email"
          placeholder="Email"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email && errors.email.message}
          {...register("email", {
            required: "You must enter an email",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value is not a valid email format",
            },
          })}
        />

        <SubmitButton
          loading={isSubmitting}
          buttonText="Reset"
        />
      </form>

      <Grid container justifyContent="center">
        <Grid item>
          <Typography
            display="inline"
            sx={{ mr: 1 }}
          >
            Remember your password?
          </Typography>

          <Link
            to={Internal.auth.signIn.path}
            style={{ textDecoration: "none" }}
          >
            <Typography
              color="primary"
              display="inline"
            >
              Sign in
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </AuthBox>
  )
}

export default ForgotPassword
