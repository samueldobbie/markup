import { TextInput, Textarea, SimpleGrid, Group, Title, Button, Container } from "@mantine/core"
import { useForm } from "@mantine/form"

function Support() {
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
    <Container size="sm">
      <form onSubmit={form.onSubmit(() => { })}>
        <Title
          order={2}
          size="h1"
          weight={900}
        >
          Get in touch
        </Title>

        <SimpleGrid cols={2} mt="xl" breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <TextInput
            label="Name"
            placeholder="Name"
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Email"
            placeholder="Email"
            type="email"
            {...form.getInputProps("email")}
          />
        </SimpleGrid>

        <TextInput
          label="Subject"
          placeholder="Subject"
          mt="md"
          {...form.getInputProps("subject")}
        />

        <Textarea
          mt="md"
          label="Message"
          placeholder="Message"
          maxRows={10}
          minRows={5}
          autosize
          {...form.getInputProps("subject")}
        />

        <Group mt="xl">
          <Button type="submit" size="md">
            Send message
          </Button>
        </Group>
      </form>
    </Container>
  )
}

export default Support
