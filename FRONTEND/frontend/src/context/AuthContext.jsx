import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { getCurrentUser, loginUser, logoutUser } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = async () => {
    try {
      const res = await getCurrentUser()
      setUser(res.data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const login = async (credentials) => {
    const res = await loginUser(credentials)
    setUser(res.data.data.user)
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refetchUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)