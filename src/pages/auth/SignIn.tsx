// import { Checkbox, FormControlLabel, FormGroup, Grid, TextField, Typography } from "@mui/material"
// import { useForm } from "react-hook-form"
// import { Link } from "react-router-dom"
// import AuthBox from "./components/AuthBox"
// // import SubmitButton from "components/button/SubmitButton"
// import { signInWithEmailAndPassword } from "firebase/auth"
// import { auth } from "utils/Firebase"
// import { Internal } from "utils/Page"
// import { moveToPage } from "utils/Location"
// import { textFieldStyles } from "./TextFieldStyles"

// interface Form {
//   email: string
//   password: string
// }

// function SignIn(): JSX.Element {
//   const {
//     register,
//     handleSubmit,
//     formState: {
//       errors,
//       isSubmitting,
//     },
//   } = useForm<Form>()

//   const onSubmit = async (data: Form) => {
//     return signInWithEmailAndPassword(auth, data.email, data.password)
//       .then(() => moveToPage(Internal.dashboard.path))
//       // .catch((error) => showErrorToast(error.message))
//   }

//   return (
//     <AuthBox>
//       <Typography gutterBottom variant="h5">
//         Sign in
//       </Typography>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <TextField
//           autoFocus
//           fullWidth
//           variant="filled"
//           margin="normal"
//           type="email"
//           label="Email"
//           placeholder="Email"
//           autoComplete="email"
//           error={!!errors.email}
//           helperText={errors.email && errors.email.message}
//           sx={textFieldStyles}
//           {...register("email", {
//             required: "You must enter an email",
//             pattern: {
//               value: /\S+@\S+\.\S+/,
//               message: "Entered value is not a valid email format",
//             },
//           })}
//         />

//         <TextField
//           fullWidth
//           variant="filled"
//           margin="normal"
//           type="password"
//           label="Password"
//           placeholder="Password"
//           autoComplete="new-password"
//           error={!!errors.password}
//           helperText={errors.password && errors.password.message}
//           sx={textFieldStyles}
//           {...register("password", {
//             required: "You must enter a password",
//           })}
//         />

//         <FormGroup>
//           <FormControlLabel
//             control={<Checkbox />}
//             label="Remember me"
//           />
//         </FormGroup>

//         {/* <SubmitButton
//           loading={isSubmitting}
//           buttonText="Sign in"
//         /> */}
//       </form>

//       <Grid container>
//         <Grid item xs>
//           <Link
//             to={Internal.auth.forgotPassword.path}
//             style={{ textDecoration: "none" }}
//           >
//             <Typography color="primary">
//               Forgot password?
//             </Typography>
//           </Link>
//         </Grid>

//         <Grid item>
//           <Link
//             to={Internal.auth.signUp.path}
//             style={{ textDecoration: "none" }}
//           >
//             <Typography color="primary">
//               Create an account
//             </Typography>
//           </Link>
//         </Grid>
//       </Grid>
//     </AuthBox>
//   )
// }

// export default SignIn

import { TextInput, PasswordInput, Checkbox, Anchor, Paper, Title, Text, Container, Group, Button } from "@mantine/core"
import { Path } from "utils/Path"

export function SignIn() {
  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
      >
        Welcome back!
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor<"a"> href={Path.SignUp} size="sm">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Email" placeholder="you@mantine.dev" required />

        <PasswordInput label="Password" placeholder="Your password" required mt="md" />

        <Group position="apart" mt="md">
          <Checkbox label="Remember me" />
          <Anchor<"a"> href={Path.ForgotPassword} size="sm">
            Forgot password?
          </Anchor>
        </Group>

        <Button fullWidth mt="xl">
          Sign in
        </Button>
      </Paper>
    </Container>
  )
}

export default SignIn
