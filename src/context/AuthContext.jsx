import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginAdmin } from '../services/admin'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null
    } catch {
      return null
    }
  })
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    } catch { /* ignore */ }
  }, [token])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user))
      else localStorage.removeItem('user')
    } catch { /* ignore */ }
  }, [user])

  const login = async ({ email, password }) => {
    // Use admin login endpoint; treat email as username for now
    const data = await loginAdmin({ username: email, password })
    if (!data || !data.token) throw new Error('Invalid login response')
    const u = data.user || {}
    setToken(data.token)
    setUser({
      id: u.id,
      name: u.name || email,
      email: u.email || email,
      role: u.role || (Array.isArray(u.roles) ? u.roles[0] : undefined) || 'user',
      roles: Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : [],
    })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
      isAdmin: !!user && (user.role === 'admin' || user.roles?.includes('admin')),
    }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
