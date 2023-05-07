import { createStyles, Paper, Title, Text, TextInput, Button, Container, Group, Grid, Alert } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconCheck } from "@tabler/icons"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Path } from "utils/Path"
import { supabase } from "utils/Supabase"

interface ResetPasswordForm {
  password: string
  passwordConf: string
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

function ResetPassword() {
  const { classes } = useStyles()

  const [accountUpdated, setAccountUpdated] = useState(false)

  const form = useForm({
    initialValues: {
      password: "",
      passwordConf: "",
    },
    validate: {
      password: (value) => ((value.length === 0 || value.length > 6) ? null : "Must be longer than 6 characters"),
      passwordConf: (value) => ((value.length === 0 || value.length > 6) ? null : "Must be longer than 6 characters"),
    },
  })

  const handleSubmit = async (values: ResetPasswordForm) => {
    let hasError = false

    if (values.password !== values.passwordConf) {
      form.setErrors({
        password: "Passwords do not match",
        passwordConf: "Passwords do not match",
      })
    } else {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        form.setErrors({
          password: error.message,
          passwordConf: error.message,
        })

        hasError = true
      }
    }

    if (!hasError) {
      form.reset()
      setAccountUpdated(true)
    }
  }

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} align="center">
        Reset Your Password
      </Title>

      <Text color="dimmed" size="sm" align="center">
        Enter your updated password
      </Text>

      <Paper withBorder shadow="xs" p={30} radius="md" mt="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            {accountUpdated && (
              <Grid.Col xs={12}>
                <Alert icon={<IconCheck size={16} />} color="green">
                  <Text>
                    Your password has been updated.
                  </Text>

                  <Text>
                    <Link to={Path.Dashboard}>
                      Go to your dashboard
                    </Link>
                  </Text>
                </Alert>
              </Grid.Col>
            )}

            <Grid.Col xs={12}>
              <TextInput
                label="New password"
                placeholder="Password"
                description="Leave blank to keep current password."
                type="password"
                {...form.getInputProps("password")}
              />
            </Grid.Col>

            <Grid.Col xs={12}>
              <TextInput
                label="Confirm new password"
                placeholder="Password"
                description="Leave blank to keep current password."
                type="password"
                {...form.getInputProps("passwordConf")}
              />
            </Grid.Col>
          </Grid>

          <Group position="apart" mt="lg" className={classes.controls}>
            <Button className={classes.control} type="submit">
              Update password
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  )
}

export default ResetPassword
