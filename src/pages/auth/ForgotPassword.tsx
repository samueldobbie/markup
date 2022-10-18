import { createStyles, Paper, Title, Text, TextInput, Button, Container, Group, Anchor, Center, Box } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconArrowLeft } from "@tabler/icons"
import { Path } from "utils/Path"
import { supabase } from "utils/Supabase"

interface ForgotPasswordForm {
  email: string
}

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

  const form = useForm({
    initialValues: {
      email: "",
    }
  })

  const handleForgotPassword = async (submitted: ForgotPasswordForm) => {
    const { email } = submitted

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      alert(error)
    }
  }

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} align="center">
        Forgot your password?
      </Title>

      <Text color="dimmed" size="sm" align="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
      <form onSubmit={form.onSubmit((values) => handleForgotPassword(values))}>
        <TextInput
          required
          withAsterisk
          label="Your email"
          placeholder="your@email.com"
          {...form.getInputProps("email")}
        />

        <Group position="apart" mt="lg" className={classes.controls}>
          <Anchor color="dimmed" size="sm" className={classes.control} href={Path.SignIn}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Back to login page</Box>
            </Center>
          </Anchor>

          <Button className={classes.control} type="submit">
            Reset password
          </Button>
        </Group>
        </form>
      </Paper>
    </Container>
  )
}

export default ForgotPassword
