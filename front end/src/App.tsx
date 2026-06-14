import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect, Component, ReactNode } from "react"
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { AuthProvider, ProtectedRoute } from "./lib/auth"
import { Sidebar } from "./components/layout/Sidebar"
import { Topbar } from "./components/layout/Topbar"
import Dashboard from "./app/dashboard/page"
import Customers from "./app/customers/page"
import Segments from "./app/segments/page"
import SegmentBuilder from "./app/segments/builder"
import Campaigns from "./app/campaigns/page"
import NewCampaign from "./app/campaigns/new/page"
import CampaignStats from "./app/campaigns/stats"
import AIChat from "./app/ai/page"
import Products from "./app/products/page"
import Projects from "./app/projects/page"
import Inbox from "./app/inbox/page"
import AuthPage from "./app/auth/page"

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center p-8">
          <div className="bg-white border border-red-200 rounded-3xl p-10 max-w-xl w-full shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-3">Something went wrong</h1>
            <pre className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto whitespace-pre-wrap border border-gray-200">
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-6 bg-[#ec5c48] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d85240] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function Layout({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string, type: string } | null>(null)

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setToast(detail)
    }
    window.addEventListener("show-toast", handleToast)
    return () => window.removeEventListener("show-toast", handleToast)
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-primary overflow-x-hidden pb-24 md:pb-10 flex justify-center">
      <div className="w-full p-4 md:p-8 max-w-[1500px] flex flex-col gap-6 md:gap-8">
        <Topbar />

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-start mt-2 w-full">
          <Sidebar />
          <main className="flex-1 min-w-0 w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#121212] text-white py-4 px-6 rounded-[1.8rem] shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-subtle/10 transition-all duration-300">
          {toast.type === "success" && <CheckCircle2 size={18} className="text-[#ec5c48]" />}
          {toast.type === "error" && <AlertCircle size={18} className="text-[#ec5c48]" />}
          {toast.type === "warning" && <AlertTriangle size={18} className="text-[#ec5c48]" />}
          {toast.type === "info" && <Info size={18} className="text-[#ec5c48]" />}
          <span className="text-[14px] font-bold tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

// ── CRM app — all routes require authentication ────────────────────────────────
function CRMApp() {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/segments/new" element={<SegmentBuilder />} />
          <Route path="/segments/:id" element={<SegmentBuilder />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<NewCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignStats />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="/products" element={<Products />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthPage />} />

            {/* All other routes are protected (CRM App) */}
            <Route path="/*" element={<CRMApp />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
