import { TextInput, SimpleGrid, Group, Title, Button, Container, Alert, Text, Code } from "@mantine/core"
import { useForm } from "@mantine/form"
import { IconCheck } from "@tabler/icons"
import { useEffect, useState } from "react"
import { supabase } from "utils/Supabase"

interface SettingsForm {
  email: string
  password: string
  passwordConf: string
}

function Settings() {
  const [email, setEmail] = useState("")
  const [accountUpdated, setAccountUpdated] = useState(false)

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      passwordConf: "",
    },
    validate: {
      email: (value) => (value.length === 0 || /^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => ((value.length === 0 || value.length > 6) ? null : "Must be longer than 6 characters"),
      passwordConf: (value) => ((value.length === 0 || value.length > 6) ? null : "Must be longer than 6 characters"),
    },
  })

  const handleSubmit = async (values: SettingsForm) => {
    if (values.password !== values.passwordConf) {
      form.setErrors({
        password: "Passwords do not match",
        passwordConf: "Passwords do not match",
      })

      return
    }

    if (values.email.length === 0 && values.password.length === 0) {
      form.setErrors({
        email: "Must change at least one field",
        password: "Must change at least one field",
        passwordConf: "Must change at least one field",
      })

      return
    }

    let hasError = false

    if (values.email.length > 0) {
      const { error } = await supabase.auth.updateUser({
        email: values.email,
      })

      if (error) {
        form.setErrors({ email: error.message })
        hasError = true
      }
    }

    if (values.password.length > 0) {
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

  useEffect(() => {
    const func = async () => {
      const user = await supabase.auth.getUser()

      if (user) {
        setEmail(user.data.user?.email ?? "")
      }
    }

    func()
  }, [])

  return (
    <Container size="sm">
      <Title
        order={2}
        size="h1"
        weight={900}
      >
        Settings
      </Title>

      {accountUpdated && (
        <Alert icon={<IconCheck size={16} />} title="Updated" color="green" mt="xl">
          <Text>
            Your account has been updated.
          </Text>
        </Alert>
      )}

      <Text mt="xl" color="dimmed">
        Your current email is <Code display="inline" p={5}>{email}</Code>
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="New email"
          placeholder="Email"
          description="Leave blank to keep current email. You will need to verify your new email before you can use it to sign in."
          type="email"
          mt="xl"
          {...form.getInputProps("email")}
        />

        <SimpleGrid cols={2} mt="md" breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <TextInput
            label="New password"
            placeholder="Password"
            description="Leave blank to keep current password."
            type="password"
            {...form.getInputProps("password")}
          />

          <TextInput
            label="Confirm new password"
            placeholder="Password"
            description="Leave blank to keep current password."
            type="password"
            {...form.getInputProps("passwordConf")}
          />
        </SimpleGrid>

        <Group mt="xl">
          <Button type="submit" size="md">
            Save changes
          </Button>
        </Group>
      </form>
    </Container>
  )
}

export default Settings
