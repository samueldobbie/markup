import { TextInput, PasswordInput, Anchor, Paper, Title, Text, Container, Button } from "@mantine/core"
import { useForm } from "@mantine/form"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { supabase } from "utils/Supabase"

interface SignUpForm {
  email: string
  password: string
  passwordConf: string
}

function SignUp(): JSX.Element {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      passwordConf: "",
    },
    validate: {
      password: (value) => (value.length > 6 ? null : "Must be longer than 6 characters"),
      passwordConf: (value) => (value.length > 6 ? null : "Must be longer than 6 characters"),
    },
  })

  const handleSignUp = async (submitted: SignUpForm) => {
    const { email, password, passwordConf } = submitted

    if (password !== passwordConf) {
      alert("Those passwords don't match. Please try again!")
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert(error)
    }

    moveToPage(Path.Dashboard)
  }

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
        <form onSubmit={form.onSubmit((values) => handleSignUp(values))}>
          <TextInput
            required
            withAsterisk
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            required
            withAsterisk
            mt="md"
            label="Password"
            placeholder="Your password"
            {...form.getInputProps("password")}
          />

          <PasswordInput
            required
            withAsterisk
            mt="md"
            label="Confirm password"
            placeholder="Your password"
            {...form.getInputProps("passwordConf")}
          />

          <Button fullWidth mt="xl" type="submit">
            Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

export default SignUp
