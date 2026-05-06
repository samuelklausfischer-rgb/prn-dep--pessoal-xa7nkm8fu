import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

export type UserRole = 'Admin' | 'Financeiro'

interface AuthContextType {
  user: any
  role: UserRole
  setRole: (role: UserRole) => void
  signIn: (email: string, pass: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(pb.authStore.record)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('Admin')

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record)
    })
    setLoading(false)
    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, pass: string) => {
    try {
      await pb.collection('users').authWithPassword(email, pass)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, role, setRole, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
