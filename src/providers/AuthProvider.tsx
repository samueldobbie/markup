import React, { useContext, useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "utils/Supabase"
import notify from "utils/Notifications"

interface IAuthContext {
  user: User | null
}

const AuthContext = React.createContext({ user: null } as IAuthContext)

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => notify.error("Failed to load user."))

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
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
