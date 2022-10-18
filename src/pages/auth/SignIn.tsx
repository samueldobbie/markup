import { TextInput, PasswordInput, Checkbox, Anchor, Paper, Title, Text, Container, Group, Button } from "@mantine/core"
import { useForm } from "@mantine/form"
import { moveToPage } from "utils/Location"
import { Path } from "utils/Path"
import { supabase } from "utils/Supabase"

interface SignInForm {
  email: string
  password: string
}

function SignIn(): JSX.Element {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    }
  })

  const handleSignIn = async (submitted: SignInForm) => {
    const { email, password } = submitted

    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
        Welcome back!
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        Do not have an account yet?{" "}
        <Anchor<"a"> href={Path.SignUp} size="sm">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit((values) => handleSignIn(values))}>
          <TextInput
            autoFocus
            required
            withAsterisk
            label="Email"
            type="email"
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

          <Group position="apart" mt="md">
            <Checkbox label="Remember me" />
            <Anchor<"a"> href={Path.ForgotPassword} size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

export default SignIn
