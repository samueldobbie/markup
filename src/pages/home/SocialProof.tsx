import { Image, Group } from "@mantine/core"
import classes from "./SocialProof.module.css"

function SocialProof() {
  return (
    <Group justify="center" className={classes.row}>
      <Image
        src="/nhs-logo.svg"
        className={`${classes.logo} ${classes.nhsImage}`}
        alt="NHS"
      />

      <Image
        src="/sail-databank-logo.png"
        className={`${classes.logo} ${classes.sailImage}`}
        alt="SAIL Databank"
      />
    </Group>
  )
}

export default SocialProof
