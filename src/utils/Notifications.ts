import { showNotification } from "@mantine/notifications"

class Notification {
  info(title: string, message: string = "") {
    showNotification({
      title,
      message,
      color: "gray",
    })
  }

  success(title: string, message: string = "") {
    showNotification({
      title,
      message,
      color: "green",
    })
  }

  warning(title: string, message: string = "") {
    showNotification({
      title,
      message,
      color: "yellow",
    })
  }

  error(title: string, message: string = "") {
    showNotification({
      title,
      message,
      color: "red",
    })
  }
}

const notify = new Notification()

export default notify
