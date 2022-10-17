import { useAuth } from "providers/AuthProvider"
import { Navigate } from "react-router-dom"
import { Path } from "utils/Path"

function UnprotectedRoute({ children }: any): JSX.Element {
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
