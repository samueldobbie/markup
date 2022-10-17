import { useAuth } from "providers/AuthProvider"
import { Navigate } from "react-router-dom"
import { Path } from "utils/Path"

function ProtectedRoute({ children }: any): JSX.Element {
  const { user } = useAuth()

  if (user === null) {
    return <Navigate to={Path.SignIn} replace />
  }

  return (
    <>
      {children}
    </>
  )
}

export default ProtectedRoute
