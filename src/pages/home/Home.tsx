import { Title, Text, Button, Container, Image, useComputedColorScheme, Modal, Card, Grid } from "@mantine/core"
import { useAuth } from "providers"
import { useState } from "react"
import { DEMO_DOMAINS } from "utils/Demo"
import { Path, toAnnotateUrl } from "utils/Path"
import Dots from "./Dots"
import SocialProof from "./SocialProof"
import classes from "./Home.module.css"

function Home() {
  const { user } = useAuth()

  const primaryButtonLink = user === null ? Path.SignUp : Path.Dashboard
  const primaryButtonText = user === null ? "Get started" : "Go to dashboard"
  const colorScheme = useComputedColorScheme("dark")
  const demoImage = colorScheme === "dark"
    ? "https://markup-storage.s3.eu-west-2.amazonaws.com/annotate-dark-v2.png"
    : "https://markup-storage.s3.eu-west-2.amazonaws.com/annotate-light-v2.png"

  const [openedDemoDomainModal, setOpenedDemoDomainModal] = useState(false)

  return (
    <>
      <Container className={classes.wrapper} size={1400}>
        <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
        <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

        <div className={classes.inner}>
          <Title className={classes.title}>
            Turn text into{" "}
            <span className={classes.highlight}>
              structured data
            </span>,<br />without the hassle.
          </Title>

          <Container p={20} size={600}>
            <Text size="lg" c="dimmed" className={classes.description}>
              Markup is an annotation tool for rapidly building structured<br />datasets from free-text for NLP and ML. Powered by AI.
            </Text>
          </Container>

          <div className={classes.controls}>
            <Button
              className={classes.control}
              size="lg"
              variant="default"
              component="a"
              onClick={() => setOpenedDemoDomainModal(true)}
            >
              Try demo
            </Button>

            <Button
              className={classes.control}
              size="lg"
              component="a"
              href={primaryButtonLink}
            >
              {primaryButtonText}
            </Button>
          </div>
        </div>

        <div className={classes.demoImage}>
          <Image src={demoImage} radius={10} />
        </div>

        <div style={{ marginTop: 80 }}>
          <SocialProof />
        </div>
      </Container>

      <DemoDomainModal
        openedModal={openedDemoDomainModal}
        setOpenedModal={setOpenedDemoDomainModal}
      />
    </>
  )
}

interface Props {
  openedModal: boolean
  setOpenedModal: (v: boolean) => void
}

function DemoDomainModal({ openedModal, setOpenedModal }: Props) {
  return (
    <Modal
      size="xl"
      opened={openedModal}
      onClose={() => setOpenedModal(false)}
      title="Select documents to annotate"
      centered
    >
      <Grid>
        {DEMO_DOMAINS.map((domain, index) => (
          <Grid.Col
            span={6}
            onClick={() => window.location.href = toAnnotateUrl(domain.id)}
            style={{ cursor: "pointer" }}
            key={index}
          >
            <Card shadow="sm">
              <Text size="xl" fw={500}>
                {domain.name}
              </Text>

              <Text size="sm" c="dimmed" style={{ marginTop: 10 }}>
                {domain.description}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Modal>
  )
}

export default Home
