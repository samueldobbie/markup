import { Card, Text } from "@mantine/core"
import { SectionProps } from "./Interfaces"

function Output({ workspace }: SectionProps) {
  return (
    <Card withBorder radius="md" p="xl">
      <Text size="lg" weight={500}>
        Output
      </Text>
    </Card>
  )
}

export default Output
