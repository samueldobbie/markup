import { createStyles } from "@mantine/core"
import { Image, useMantineTheme, Group } from "@mantine/core"

const useStyles = createStyles((theme) => ({
  nhsImage: {
    width: "180px !important",
    marginRight: "250px !important",

    "@media (max-width: 456px)": {
      width: "110px !important",
      marginRight: "0px !important",
      marginBottom: "20px !important",
    },

    "@media (min-width: 457px) and (max-width: 920px)": {
      width: "110px !important",
      marginRight: "0px !important",
    },
  },

  sailImage: {
    width: "450px !important",

    "@media (max-width: 456px)": {
      width: "300px !important",
    },
  },
}))

function SocialProof() {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const logos = theme.colorScheme === "dark"
    ? ["https://i.imgur.com/WrsAhwq.png", "https://i.imgur.com/6CsuX24.png"]
    : ["https://i.imgur.com/j0S80Zc.png", "https://i.imgur.com/6WxTk1c.png"]

  return (
    <Group position="center" sx={{ opacity: 0.2 }}>
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
