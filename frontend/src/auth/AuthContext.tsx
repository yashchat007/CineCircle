import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, tokenStore, UNAUTHORIZED_EVENT } from '../api/client'
import type { Account, AuthResponse } from '../api/types'

interface AuthState {
  user: Account | null
  loading: boolean
  signIn: (response: AuthResponse) => void
  signOut: () => void
  updateUser: (user: Account) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null)
  const [loading, setLoading] = useState(() => tokenStore.get() !== null)

  const signOut = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const signIn = useCallback((response: AuthResponse) => {
    tokenStore.set(response.token)
    setUser(response.user)
  }, [])

  useEffect(() => {
    if (!tokenStore.get()) return
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut)
  }, [signOut])

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, updateUser: setUser }),
    [user, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
