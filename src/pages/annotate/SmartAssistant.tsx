import { Text } from "@mantine/core"

interface Props {
  workspaceId: string
  setSuggestionCount: (count: number) => void
}

function SmartAssistant({ workspaceId, setSuggestionCount }: Props) {
  return (
    <Text sx={{
      fontSize: 12,
      textTransform: "uppercase",
      fontWeight: "bold",
    }}>
      Coming soon
    </Text>
  )
}

export default SmartAssistant
