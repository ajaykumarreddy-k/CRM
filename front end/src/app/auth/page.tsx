import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, ArrowRight, Zap, Users, TrendingUp, Bot } from "lucide-react"
import { useAuth, DEMO_EMAIL, DEMO_PASSWORD } from "@/src/lib/auth"

// ── Animated stat pills on the left panel ────────────────────────────────────

const STATS = [
  { icon: Users,     label: "Active Customers",  value: "12,480",  color: "#10b981" },
  { icon: TrendingUp, label: "Campaign CVR",      value: "24.7%",   color: "#2563eb" },
  { icon: Zap,        label: "Messages Sent",     value: "94.2K",   color: "#ec5c48" },
  { icon: Bot,        label: "AI Segments Built", value: "3,910",   color: "#a855f7" },
]

// ── Feature bullets ───────────────────────────────────────────────────────────

const FEATURES = [
  "AI-powered customer segmentation",
  "Omni-channel campaign dispatch",
  "Real-time funnel analytics",
  "Gemini-powered smart inbox replies",
]

export default function AuthPage() {
  const { login, signup, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: Location })?.from?.pathname || "/"

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  // ── Form state ─────────────────────────────────────────────────────────────
  const [mode, setMode]           = useState<"login" | "signup">("login")
  const [name, setName]           = useState("")
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const [animKey, setAnimKey]     = useState(0)

  const switchMode = (m: "login" | "signup") => {
    if (m === mode) return
    setMode(m)
    setError("")
    setAnimKey(k => k + 1)
  }

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError("")
    setLoading(true)
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD)
      navigate(from, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      navigate(from, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Brand Panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[48%] xl:w-[44%] relative overflow-hidden p-12 xl:p-16"
        style={{
          background: "linear-gradient(145deg, #0d0f14 0%, #1a1c20 40%, #1a2340 70%, #1e3a8a 100%)",
        }}
      >
        {/* Glowing orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #ec5c48 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 bg-white/10 backdrop-blur text-white rounded-full flex items-center justify-center border border-white/20">
              <span className="font-bold text-xl tracking-tighter">
                X<span className="text-xs underline underline-offset-2 align-top ml-[1px]">E</span>
              </span>
            </div>
            <span className="text-white font-bold text-[22px] tracking-tight">XENO CRM</span>
          </div>

          {/* Headline */}
          <h2 className="text-white text-[38px] xl:text-[44px] font-bold leading-[1.1] tracking-tight mb-6">
            The AI platform for<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #a78bfa)" }}>
              customer relationships
            </span>
          </h2>
          <p className="text-white/50 text-[17px] leading-relaxed mb-14 max-w-[380px]">
            Power your teams with AI-native segmentation, campaign dispatch, and real-time analytics.
          </p>

          {/* Feature bullets */}
          <ul className="space-y-3.5 mb-14">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/70 text-[15px] font-medium">
                <div className="w-5 h-5 rounded-full bg-[#2563eb]/30 border border-[#2563eb]/50 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="rounded-2xl p-4 border border-white/10 backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: `${s.color}22` }}>
                    <Icon size={13} style={{ color: s.color }} />
                  </div>
                  <span className="text-white/40 text-[11px] font-semibold tracking-wide uppercase">{s.label}</span>
                </div>
                <div className="text-white text-[26px] font-bold tracking-tight leading-none">{s.value}</div>
              </div>
            )
          })}
        </div>

        {/* Bottom attribution */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <p className="text-white/30 text-[13px]">Built for the XENO Engineering Interview · 2026</p>
        </div>
      </div>

      {/* ── Right: Auth Form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f8fb] p-6 sm:p-10 relative overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#121212] text-white rounded-full flex items-center justify-center">
            <span className="font-bold text-lg tracking-tighter">
              X<span className="text-xs underline underline-offset-2 align-top ml-[1px]">E</span>
            </span>
          </div>
          <span className="font-bold text-[20px] tracking-tight text-[#1a1c20]">XENO CRM</span>
        </div>

        <div className="w-full max-w-[420px]">

          {/* Mode toggle */}
          <div className="flex bg-white rounded-2xl p-1 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-200 ${
                  mode === m
                    ? "bg-[#1a1c20] text-white shadow-md"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div key={animKey} style={{ animation: "fadeSlideUp 0.2s ease-out both" }}>
            <h1 className="text-[28px] font-bold text-[#1a1c20] mb-1 tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-400 text-[15px] mb-8">
              {mode === "login"
                ? "Sign in to your XENO CRM workspace."
                : "Start managing customer relationships with AI."}
            </p>

            {/* Demo Login CTA */}
            {mode === "login" && (
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full mb-6 py-3 rounded-2xl border-2 border-dashed border-[#2563eb]/40 bg-[#2563eb]/5 hover:bg-[#2563eb]/10 text-[#2563eb] font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Zap size={15} className="group-hover:animate-bounce" />
                Demo Login — use admin@xeno.com
                <ArrowRight size={14} className="opacity-60" />
              </button>
            )}

            {/* Divider */}
            {mode === "login" && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-[12px] font-semibold uppercase tracking-wider">or sign in manually</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (signup only) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-[13px] font-bold text-[#1a1c20] mb-1.5" htmlFor="auth-name">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Ajay Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] text-[#1a1c20] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]/60 transition-all shadow-sm"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a1c20] mb-1.5" htmlFor="auth-email">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] text-[#1a1c20] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]/60 transition-all shadow-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-bold text-[#1a1c20] mb-1.5" htmlFor="auth-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPw ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min. 6 characters" : "Enter password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-200 text-[14px] text-[#1a1c20] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]/60 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password (signup only) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-[13px] font-bold text-[#1a1c20] mb-1.5" htmlFor="auth-confirm">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm"
                      type={showCfm ? "text" : "password"}
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-200 text-[14px] text-[#1a1c20] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]/60 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCfm(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1a1c20] hover:bg-[#2d2f35] text-white font-bold text-[15px] transition-all flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Switch mode link */}
              <p className="text-center text-[13px] text-gray-400 pt-1">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="text-[#2563eb] font-bold hover:underline"
                >
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* Bottom note */}
        <p className="absolute bottom-6 text-[12px] text-gray-300 font-medium text-center px-4">
          XENO CRM · Engineering Take-Home · All data is demo only
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
