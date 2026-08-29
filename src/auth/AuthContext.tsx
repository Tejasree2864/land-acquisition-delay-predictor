import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * ---------------------------------------------------------------------------
 * DEMO-GRADE ACCESS GATE
 * ---------------------------------------------------------------------------
 * This is a FRONTEND-ONLY login. Because GitHub Pages is static hosting with
 * no server, credentials checked here ship to the browser and are NOT truly
 * secret. This is intended as an access gate for a hackathon demo.
 *
 * For production government use, replace `authenticate()` with a call to a
 * real authentication backend (e.g. OAuth2 / OIDC via NIC eAuth, an internal
 * SSO, or a token API). The rest of the app (ProtectedRoute, context) stays
 * the same — only this function changes.
 * ---------------------------------------------------------------------------
 */

export interface GovUser {
  username: string
  name: string
  role: string
  department: string
}

interface AuthState {
  user: GovUser | null
  login: (username: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
}

// Authorized government accounts (demo). Replace with a backend in production.
const AUTHORIZED: Record<string, { password: string; user: GovUser }> = {
  admin: {
    password: 'landwatch@2025',
    user: {
      username: 'admin',
      name: 'Administrator',
      role: 'System Administrator',
      department: 'Land Acquisition Cell',
    },
  },
  officer: {
    password: 'gov@2025',
    user: {
      username: 'officer',
      name: 'District Officer',
      role: 'Acquisition Officer',
      department: 'District Revenue Department',
    },
  },
}

const STORAGE_KEY = 'landwatch.session'

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GovUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as GovUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [user])

  const value = useMemo<AuthState>(
    () => ({
      user,
      login: (username, password) => {
        const key = username.trim().toLowerCase()
        const record = AUTHORIZED[key]
        if (!record || record.password !== password) {
          return { ok: false, error: 'Invalid credentials. Access is restricted to authorized personnel.' }
        }
        setUser(record.user)
        return { ok: true }
      },
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
