import { Image, Group, useComputedColorScheme } from "@mantine/core"
import classes from "./SocialProof.module.css"

function SocialProof() {
  const colorScheme = useComputedColorScheme("dark")
  const logos = colorScheme === "dark"
    ? ["https://i.imgur.com/WrsAhwq.png", "https://i.imgur.com/6CsuX24.png"]
    : ["https://i.imgur.com/j0S80Zc.png", "https://i.imgur.com/6WxTk1c.png"]

  return (
    <Group justify="center" style={{ opacity: 0.2 }}>
      <Image
        src={logos[0]}
        className={classes.nhsImage}
      />

      <Image
        src={logos[1]}
        className={classes.sailImage}
      />
    </Group>
  )
}

export default SocialProof
