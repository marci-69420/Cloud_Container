import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

// This context manages user authentication state, including login, registration, and logout functionality. 
// It also handles token storage and retrieval from localStorage, and sets up an Axios interceptor to include the token in all requests.
// It handles user registration and login for the whole application.

//Disclaimer: This file was implemented with Copilot

interface User {
  _id: string
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Axios interceptor to add token to requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3000/user/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, username: string) => {
    await axios.post('http://localhost:3000/user/register', {
      email,
      password,
      username
    })
    // Auto-login after registration
    await login(email, password)
  }

  const login = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:3000/user/login', {
      email,
      password
    })
    const { token } = response.data
    localStorage.setItem('token', token)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}