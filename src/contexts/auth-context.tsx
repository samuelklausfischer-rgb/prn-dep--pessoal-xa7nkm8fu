import { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'Admin' | 'Financeiro'

interface AuthContextType {
  role: UserRole
  setRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType>({ role: 'Admin', setRole: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('Admin')
  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
