import { notifications } from "@mantine/notifications"
import { IconAlertTriangle, IconCheck, IconQuestionMark, IconX } from "@tabler/icons-react"

const OUTPUT_ERROR_TO_CONSOLE = true

class Notification {
  info(message: string) {
    notifications.show({
      title: "Info",
      message,
      color: "gray",
      icon: <IconQuestionMark />,
    })
  }

  success(message: string) {
    notifications.show({
      title: "Success",
      message,
      color: "green",
      icon: <IconCheck />,
    })
  }

  warning(message: string) {
    notifications.show({
      title: "Warning",
      message,
      color: "yellow",
      icon: <IconAlertTriangle />,
    })
  }

  error(message: string, error?: Error) {
    if (error && OUTPUT_ERROR_TO_CONSOLE) {
      console.error(error.message)
    }

    notifications.show({
      title: "Error",
      message,
      color: "red",
      icon: <IconX />,
    })
  }
}

const notify = new Notification()

export default notify
