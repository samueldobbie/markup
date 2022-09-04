import { userState } from "context/store/Auth"
import { Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { Helmet } from "react-helmet-async"
import { Internal } from "constants/Page"

interface Props {
  title: string
  children: any
}

function PrivateRoute(props: Props): JSX.Element {
  const { title, children } = props
  const user = useRecoilValue(userState)

  if (user == null) {
    return <Navigate to={Internal.auth.signIn.path} replace />
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
