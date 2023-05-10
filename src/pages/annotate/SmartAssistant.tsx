import { Center, Grid, Text } from "@mantine/core"

interface Props {
  workspaceId: string
  setSuggestionCount: (count: number) => void
}

function SmartAssistant({ workspaceId, setSuggestionCount }: Props) {
  return (
    <Grid>
      <Grid.Col xs={12}>
        <Center>
          <Text color="dimmed">
            Predictive annotations are currently in beta. Please check back later.
          </Text>
        </Center>
      </Grid.Col>
    </Grid>
  )
}

export default SmartAssistant
