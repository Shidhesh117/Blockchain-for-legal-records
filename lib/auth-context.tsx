'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, UserRole } from './types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simulated user database
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'citizen@demo.com',
    password: 'demo123',
    role: 'citizen',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Adv. Priya Patel',
    email: 'authority@demo.com',
    password: 'demo123',
    role: 'authority',
    createdAt: new Date('2024-01-10'),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState(DEMO_USERS)

  useEffect(() => {
    const stored = localStorage.getItem('evault_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800))
    
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    )
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('evault_user', JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800))
    
    if (users.find((u) => u.email === email)) {
      return false
    }

    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password,
      role,
      createdAt: new Date(),
    }

    setUsers([...users, newUser])
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem('evault_user', JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('evault_user')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
