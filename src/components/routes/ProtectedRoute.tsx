import { Internal } from "utils/Page"
import { useAuth } from "providers/AuthProvider"
import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }: any): JSX.Element {
  const { user } = useAuth()

  if (user === null) {
    return <Navigate to={Internal.auth.signIn.path} replace />
  }

  return (
    <>
      {children}
    </>
  )
}

export default ProtectedRoute
