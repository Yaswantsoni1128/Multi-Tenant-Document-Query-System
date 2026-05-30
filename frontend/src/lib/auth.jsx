import { createContext, useContext, useEffect, useState } from 'react'
import { setAuthToken } from './api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'rag_token_v1'

function parseJwt(token) {
  try {
    const p = token.split('.')
    if (p.length < 2) return null
    return JSON.parse(atob(p[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      setAuthToken(stored)
      const payload = parseJwt(stored)
      setUser(payload ? { email: payload.email, id: payload.user_id } : { email: 'user' })
      setToken(stored)
    }
    setReady(true)
  }, [])

  const login = (newToken) => {
    if (!newToken) return
    localStorage.setItem(TOKEN_KEY, newToken)
    setAuthToken(newToken)
    const payload = parseJwt(newToken)
    setUser(payload ? { email: payload.email, id: payload.user_id } : { email: 'user' })
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
