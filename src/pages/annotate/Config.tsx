import { Card, Text } from "@mantine/core"
import { SectionProps } from "./Interfaces"

function Config({ workspace }: SectionProps) {
  return (
    <Card withBorder radius="md" p="xl">
      <Text size="lg" weight={500}>
        Config
      </Text>
    </Card>
  )
}

export default Config
