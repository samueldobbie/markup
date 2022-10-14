import { Internal } from "utils/Page"
import { useAuth } from "providers/AuthProvider"
import { Navigate } from "react-router-dom"

function UnprotectedRoute({ children }: any): JSX.Element {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={Internal.dashboard.path} replace />
  }

  return (
    <>
      {children}
    </>
  )
}

export default UnprotectedRoute
