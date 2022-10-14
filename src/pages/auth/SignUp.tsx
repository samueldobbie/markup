// import { Grid, TextField, Typography } from "@mui/material"
// import { useForm } from "react-hook-form"
// import { Link } from "react-router-dom"
// import AuthBox from "./components/AuthBox"
// // import SubmitButton from "components/button/SubmitButton"
// import { createUserWithEmailAndPassword } from "firebase/auth"
// import { auth } from "utils/Firebase"
// import { Internal } from "utils/Page"
// import { moveToPage } from "utils/Location"
// import { textFieldStyles } from "./TextFieldStyles"

// interface Form {
//   email: string
//   password: string
//   passwordConfirmation: string
// }

// function SignUp(): JSX.Element {
//   const {
//     register,
//     handleSubmit,
//     formState: {
//       errors,
//       isSubmitting,
//     },
//   } = useForm<Form>()

//   const onSubmit = (data: Form) => {
//     if (data.password === data.passwordConfirmation) {
//       return createUserWithEmailAndPassword(auth, data.email, data.password)
//         .then(() => moveToPage(Internal.dashboard.path))
//         // .catch((error) => showErrorToast(error.message))
//     } else {
//       // showErrorToast("The confirmation password doesn't match")
//     }
//   }

//   return (
//     <AuthBox>
//       <Typography gutterBottom variant="h5">
//         Sign up
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

//         <TextField
//           fullWidth
//           variant="filled"
//           margin="normal"
//           type="password"
//           label="Confirm Password"
//           placeholder="Confirm Password"
//           autoComplete="off"
//           error={!!errors.passwordConfirmation}
//           helperText={errors.passwordConfirmation && errors.passwordConfirmation.message}
//           sx={textFieldStyles}
//           {...register("passwordConfirmation", {
//             required: "You must confirm your password",
//           })}
//         />

//         {/* <SubmitButton
//           loading={isSubmitting}
//           buttonText="Sign up"
//         /> */}
//       </form>

//       <Grid
//         container
//         justifyContent="center"
//       >
//         <Typography
//           display="inline"
//           sx={{ mr: 1 }}
//         >
//           Have an account?
//         </Typography>

//         <Link
//           to={Internal.auth.signIn.path}
//           style={{ textDecoration: "none" }}
//         >
//           <Typography
//             color="primary"
//             display="inline"
//           >
//             Sign in
//           </Typography>
//         </Link>
//       </Grid>
//     </AuthBox>
//   )
// }

// export default SignUp

import { TextInput, PasswordInput, Anchor, Paper, Title, Text, Container, Button } from "@mantine/core"
import { Path } from "utils/Path"

export function SignUp() {
  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
      >
        Welcome to Markup!
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        Already have an account?{" "}
        <Anchor<"a"> href={Path.SignIn} size="sm">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Email" placeholder="you@mantine.dev" required />

        <PasswordInput label="Password" placeholder="Your password" required mt="md" />

        <PasswordInput label="Confirm password" placeholder="Your password" required mt="md" />

        <Button fullWidth mt="xl">
          Sign up
        </Button>
      </Paper>
    </Container>
  )
}

export default SignUp
