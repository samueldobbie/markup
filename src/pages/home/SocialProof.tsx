import { Image, useMantineTheme, Group } from "@mantine/core"

function SocialProof() {
  const theme = useMantineTheme()
  const logos = theme.colorScheme === "dark"
    ? ["https://i.imgur.com/WrsAhwq.png", "https://i.imgur.com/6CsuX24.png"]
    : ["https://i.imgur.com/j0S80Zc.png", "https://i.imgur.com/6WxTk1c.png"]

  return (
    <Group position="center" sx={{ opacity: 0.2 }}>
      <Image
        src={logos[0]}
        width={180}
        sx={{ marginRight: 250 }}
      />

      <Image
        src={logos[1]}
        width={450}
      />
    </Group>
  )
}

export default SocialProof
