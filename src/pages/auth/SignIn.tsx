import { Grid, TextField, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import AuthBox from "./components/AuthBox"
import SubmitButton from "components/button/SubmitButton"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "constants/Firebase"
import { Internal } from "constants/Page"

interface Form {
  email: string
  password: string
}

function SignIn(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<Form>()

  const onSubmit = (data: Form) => {
    return signInWithEmailAndPassword(auth, data.email, data.password)
      // .then(() => moveToPage(Page.Client.Dashboard.path))
      // .catch((error) => showErrorToast(error.message))
  }

  return (
    <AuthBox>
      <Typography gutterBottom variant="h5">
        Sign in
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
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

        <TextField
          fullWidth
          variant="filled"
          margin="normal"
          type="password"
          label="Password"
          placeholder="Password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password && errors.password.message}
          {...register("password", {
            required: "You must enter a password",
          })}
        />

        <SubmitButton
          loading={isSubmitting}
          buttonText="Sign in"
        />
      </form>

      <Grid container>
        <Grid item xs>
          <Link
            to={Internal.auth.forgotPassword.path}
            style={{ textDecoration: "none" }}
          >
            <Typography color="primary">
              Forgot password?
            </Typography>
          </Link>
        </Grid>

        <Grid item>
          <Link
            to={Internal.auth.signUp.path}
            style={{ textDecoration: "none" }}
          >
            <Typography color="primary">
              Create an account
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </AuthBox>
  )
}

export default SignIn
