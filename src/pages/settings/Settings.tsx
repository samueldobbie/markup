import { TextInput, SimpleGrid, Group, Title, Button, Container, Card } from "@mantine/core"
import { useForm } from "@mantine/form"

function Settings() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validate: {
      name: (value) => value.trim().length < 2,
      email: (value) => !/^\S+@\S+$/.test(value),
      subject: (value) => value.trim().length === 0,
    },
  })

  return (
    <Container>
      <Card>
        <form onSubmit={form.onSubmit(() => { })}>
          <Title
            order={2}
            size="h1"
            sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}` })}
            weight={900}
          >
            Settings
          </Title>

          <TextInput
            label="Update email"
            placeholder="New email"
            name="email"
            variant="filled"
            mt="xl"
            {...form.getInputProps("email")}
          />

          <SimpleGrid cols={2} mt="md" breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
            <TextInput
              label="Update Password"
              placeholder="New password"
              name="email"
              variant="filled"
              {...form.getInputProps("email")}
            />

            <TextInput
              label="Confirm password"
              placeholder="Confirm new password"
              name="email"
              variant="filled"
              {...form.getInputProps("email")}
            />
          </SimpleGrid>

          <Group mt="xl">
            <Button type="submit" size="md">
              Update settings
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  )
}

export default Settings
