import { auth } from "utils/Firebase"
import { User } from "firebase/auth"
import React, { useContext, useState, useEffect } from "react"

interface IAuthContext {
  user: User | null
}

const AuthContext = React.createContext({ user: null } as IAuthContext)

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth
      .onAuthStateChanged((user) => {
        setUser(user)
        setLoading(false)
      })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
