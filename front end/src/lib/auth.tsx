import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// ── Demo credentials ───────────────────────────────────────────────────────────

export const DEMO_EMAIL    = "admin@xeno.com"
export const DEMO_PASSWORD = "demo2026"

const DEMO_USER: User = {
  id:     "usr_demo_001",
  name:   "Ajay Kumar",
  email:  DEMO_EMAIL,
  role:   "Marketing Admin",
  avatar: "https://i.pravatar.cc/150?img=11",
}

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = "xeno_crm_user"

// Simulate a tiny delay so it feels like a real API call
const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const persist = (u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    setUser(u)
  }

  const login = async (email: string, password: string) => {
    await delay(700)
    // Demo mode: accept demo creds exactly, OR any valid-format email+password (len>=6)
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      persist(DEMO_USER)
      return
    }
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid email or password.")
    }
    // Accept any credentials for demo purposes
    const firstName = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim()
    const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    persist({
      id:     `usr_${Date.now()}`,
      name:   capitalized || "CRM User",
      email,
      role:   "Marketing Admin",
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50) + 1}`,
    })
  }

  const signup = async (name: string, email: string, password: string) => {
    await delay(900)
    if (!name.trim())          throw new Error("Name is required.")
    if (!email.includes("@")) throw new Error("Enter a valid email address.")
    if (password.length < 6)  throw new Error("Password must be at least 6 characters.")
    persist({
      id:     `usr_${Date.now()}`,
      name:   name.trim(),
      email,
      role:   "Marketing Admin",
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50) + 1}`,
    })
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────────

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-[#121212] text-white rounded-full flex items-center justify-center shadow-md">
            <span className="font-bold text-xl tracking-tighter">
              X<span className="text-xs underline underline-offset-2 align-top ml-[1px]">E</span>
            </span>
          </div>
          <div className="w-5 h-5 border-2 border-[#ec5c48] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
