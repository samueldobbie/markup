import { showNotification } from "@mantine/notifications"
import { IconAlertTriangle, IconCheck, IconQuestionMark, IconX } from "@tabler/icons"

class Notification {
  info(message: string) {
    showNotification({
      title: "Info",
      message,
      color: "gray",
      icon: <IconQuestionMark />,
    })
  }

  success(message: string) {
    showNotification({
      title: "Success",
      message,
      color: "green",
      icon: <IconCheck />,
    })
  }

  warning(message: string) {
    showNotification({
      title: "Warning",
      message,
      color: "yellow",
      icon: <IconAlertTriangle />,
    })
  }

  error(message: string) {
    showNotification({
      title: "Error",
      message,
      color: "red",
      icon: <IconX />,
    })
  }
}

const notify = new Notification()

export default notify
