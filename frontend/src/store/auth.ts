import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'USER' | 'JEFE_AREA' | 'MANTENIMIENTO' | 'SUPERVISOR' | 'GERENTE' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  nombre: string
  role: UserRole
  cargo?: string
  area?: string
  mustChangePass: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ user, accessToken, refreshToken })
      },
      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, refreshToken: null })
      },
      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    { name: 'auth', partialize: (s) => ({ user: s.user, refreshToken: s.refreshToken }) }
  )
)
