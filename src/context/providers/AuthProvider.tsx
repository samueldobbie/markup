import { auth } from "constants/Firebase"
import { userState } from "context/store/Auth"
import { useEffect, useState } from "react"
import { useSetRecoilState } from "recoil"

function AuthProvider({ children }: any): JSX.Element {
  const setUser = useSetRecoilState(userState)

  const [pending, setPending] = useState(true)

  useEffect(() => {
    const unsubscribe = auth
      .onAuthStateChanged((user) => {
        setUser(user)
        setPending(false)
      })

    return unsubscribe
  }, [])

  return (
    <>
      {!pending && children}
    </>
  )
}

export { AuthProvider }
