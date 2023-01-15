import { createStyles, Paper, Title, Text, TextInput, Button, Container, Group, Anchor, Center, Box } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconArrowLeft } from "@tabler/icons"
import { useState } from "react"
import { Path } from "utils/Path"
import { supabase } from "utils/Supabase"

interface ForgotPasswordForm {
  email: string,
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
  const [sentEmail, setSentEmail] = useState(false)

  const form = useForm({
    initialValues: {
      email: "",
    }
  })

  const handleForgotPassword = async (submitted: ForgotPasswordForm) => {
    const { email } = submitted
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      form.setErrors({ email: error.message })
    } else {
      setSentEmail(true)
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

      <Paper withBorder shadow="xs" p={30} radius="md" mt="xl">
        {sentEmail && (
          <div style={{ backgroundColor: "rgb(226 255 231)", padding: 5, borderRadius: 5, marginBottom: 15 }}>
            <Text color="darkgreen" align="center">
              A reset link has been sent to your email
            </Text>
          </div>
        )}

        <form onSubmit={form.onSubmit((values) => handleForgotPassword(values))}>
          <TextInput
            required
            withAsterisk
            label="Email"
            type="email"
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
