import { userState } from "context/store/Auth"
import { Navigate } from "react-router-dom"
import { useRecoilValue } from "recoil"
import { Helmet } from "react-helmet-async"

interface Props {
  mustBeSignedOut?: boolean
  title: string
  children: any
}

function PublicRoute(props: Props): JSX.Element {
  const { mustBeSignedOut, title, children } = props
  const user = useRecoilValue(userState)

  if (user && mustBeSignedOut) {
    return <Navigate to="/dashboard" replace />
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

export default PublicRoute
