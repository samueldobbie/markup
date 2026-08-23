import { Center, Grid, Text } from "@mantine/core"

interface Props {
  workspaceId: string
  setSuggestionCount: (count: number) => void
}

function SmartAssistant({ workspaceId: _workspaceId, setSuggestionCount: _setSuggestionCount }: Props) {
  return (
    <Grid>
      <Grid.Col span={12}>
        <Center>
          <Text c="dimmed">
            Predictive annotations are currently in beta. Please check back later.
          </Text>
        </Center>
      </Grid.Col>
    </Grid>
  )
}

export default SmartAssistant
