import { Grid, TextField, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import AuthBox from "./components/AuthBox"
import SubmitButton from "components/button/SubmitButton"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "constants/Firebase"
import { Internal } from "constants/Page"
import { moveToPage } from "utils/Location"

interface Form {
  email: string
  password: string
  passwordConfirmation: string
}

function SignUp(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<Form>()

  const onSubmit = (data: Form) => {
    if (data.password === data.passwordConfirmation) {
      return createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(() => moveToPage(Internal.dashboard.path))
        // .catch((error) => showErrorToast(error.message))
    } else {
      // showErrorToast("The confirmation password doesn't match")
    }
  }

  return (
    <AuthBox>
      <Typography gutterBottom variant="h5">
        Sign up
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

        <TextField
          fullWidth
          variant="filled"
          margin="normal"
          type="password"
          label="Confirm Password"
          placeholder="Confirm Password"
          autoComplete="off"
          error={!!errors.passwordConfirmation}
          helperText={errors.passwordConfirmation && errors.passwordConfirmation.message}
          {...register("passwordConfirmation", {
            required: "You must confirm your password",
          })}
        />

        <SubmitButton
          loading={isSubmitting}
          buttonText="Sign up"
        />
      </form>

      <Grid
        container
        justifyContent="center"
      >
        <Typography
          display="inline"
          sx={{ mr: 1 }}
        >
          Have an account?
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
    </AuthBox>
  )
}

export default SignUp
