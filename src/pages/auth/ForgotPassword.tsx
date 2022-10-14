// import { Grid, TextField, Typography } from "@mui/material"
// import { useForm } from "react-hook-form"
// import { Link } from "react-router-dom"
// import AuthBox from "./components/AuthBox"
// import { auth } from "utils/Firebase"
// import { sendPasswordResetEmail } from "firebase/auth"
// import { Internal } from "utils/Page"
// import { textFieldStyles } from "./TextFieldStyles"

// interface Form {
//   email: string
//   password: string
// }

// function ForgotPassword(): JSX.Element {
//   const {
//     register,
//     handleSubmit,
//     formState: {
//       errors,
//       isSubmitting,
//     },
//   } = useForm<Form>()

//   const onSubmit = (data: Form) => {
//     return sendPasswordResetEmail(auth, data.email)
//       // .then(() => showSuccessToast("Reset instructions have been sent to your email."))
//       // .catch((error) => showErrorToast(error.message))
//   }

//   return (
//     <AuthBox>
//       <Typography gutterBottom variant="h5">
//         Forgotten password
//       </Typography>

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         style={{ width: "100%" }}
//       >
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

//         {/* <SubmitButton
//           loading={isSubmitting}
//           buttonText="Reset"
//         /> */}
//       </form>

//       <Grid container justifyContent="center">
//         <Grid item>
//           <Typography
//             display="inline"
//             sx={{ mr: 1 }}
//           >
//             Remember your password?
//           </Typography>

//           <Link
//             to={Internal.auth.signIn.path}
//             style={{ textDecoration: "none" }}
//           >
//             <Typography
//               color="primary"
//               display="inline"
//             >
//               Sign in
//             </Typography>
//           </Link>
//         </Grid>
//       </Grid>
//     </AuthBox>
//   )
// }

// export default ForgotPassword

import {
  createStyles,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Group,
  Anchor,
  Center,
  Box,
} from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons"
import { Path } from "utils/Path"

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  controls: {
    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column-reverse",
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      textAlign: "center",
    },
  },
}))

function ForgotPassword() {
  const { classes } = useStyles()

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} align="center">
        Forgot your password?
      </Title>

      <Text color="dimmed" size="sm" align="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput label="Your email" placeholder="me@mantine.dev" required />

        <Group position="apart" mt="lg" className={classes.controls}>
          <Anchor color="dimmed" size="sm" className={classes.control} href={Path.SignIn}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Back to login page</Box>
            </Center>
          </Anchor>

          <Button className={classes.control}>Reset password</Button>
        </Group>
      </Paper>
    </Container>
  )
}

export default ForgotPassword
