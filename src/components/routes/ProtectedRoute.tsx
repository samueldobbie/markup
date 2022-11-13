import { useDocumentTitle } from "@mantine/hooks"
import { useAuth } from "providers/AuthProvider"
import { Navigate } from "react-router-dom"
import { Path } from "utils/Path"

function ProtectedRoute({ children, title, exception }: any): JSX.Element {
  useDocumentTitle(title)

  const { user } = useAuth()

  if (user === null && (exception === undefined || (exception !== undefined && !exception()))) {
    return <Navigate to={Path.SignIn} replace />
  }

  return (
    <>
      {children}
    </>
  )
}

export default ProtectedRoute
