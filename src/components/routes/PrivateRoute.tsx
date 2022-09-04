import { userState } from "context/store/Auth"
import { Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { Helmet } from "react-helmet-async"

interface Props {
  title: string
  children: any
}

function PrivateRoute(props: Props): JSX.Element {
  const { title, children } = props
  const user = useRecoilValue(userState)

  if (user) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return (
    <>
      <Helmet>
        <title>
          {title}
        </title>
      </Helmet>

      {/* <Toast /> */}

      {children}
    </>
  )
}

export default PrivateRoute
