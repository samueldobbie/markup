import { useDocumentTitle } from "@mantine/hooks"
import { useAuth } from "providers/AuthProvider"
import { Navigate } from "react-router-dom"
import { Path } from "utils/Path"

function UnprotectedRoute({ children, title }: any): JSX.Element {
  useDocumentTitle(title)

  const { user } = useAuth()

  if (user) {
    return <Navigate to={Path.Dashboard} replace />
  }

  return (
    <>
      {children}
    </>
  )
}

export default UnprotectedRoute
