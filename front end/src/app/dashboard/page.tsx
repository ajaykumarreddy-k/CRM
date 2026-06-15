import { useEffect, useState, useRef } from "react"
import { api } from "@/src/lib/api"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { showToast } from "@/src/lib/toast"
import { Link } from "react-router-dom"
import { 
  ChevronDown, 
  ArrowRight, 
  Download, 
  Sparkles, 
  Send, 
  User, 
  Play, 
  TrendingUp, 
  TrendingDown, 
  CheckSquare 
} from "lucide-react"

interface DashboardData {
  metrics: {
    customers: number
    campaigns: number
    sent: number
    cvr: number
    clients?: number
    clientsComparison?: string
    clientsSubtitle?: string
    revenue?: number
    revenueComparison?: string
    revenueSubtitle?: string
    projects?: number
    projectsComparison?: string
    projectsSubtitle?: string
  }
}

interface ChatMessage {
  sender: "user" | "ai"
  text: string
}

// ── Hardcoded mock data — shown instantly, overridden by real API if available ──
const MOCK_DASHBOARD: DashboardData = {
  metrics: {
    customers: 2847, campaigns: 14, sent: 128430, cvr: 4.7,
    clients: 2847, clientsComparison: "+12%", clientsSubtitle: "vs 2,541 last month",
    revenue: 48920, revenueComparison: "+18%", revenueSubtitle: "$41,450 last month",
    projects: 37, projectsComparison: "+6", projectsSubtitle: "31 last month",
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(MOCK_DASHBOARD)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Chart options dropdown states
  const [showEarningsDropdown, setShowEarningsDropdown] = useState(false)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [selectedEarningType, setSelectedEarningType] = useState("Earnings")
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days")

  // AI assistant widget states
  const [activeAiTab, setActiveAiTab] = useState<"LoopAI" | "GPT Chat" | "Deep Seek">("LoopAI")
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hi, Adam 👋 How can I help you today?" }
  ])
  const [aiTyping, setAiTyping] = useState(false)

  const dropdownRef1 = useRef<HTMLDivElement>(null)
  const dropdownRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Try real API — silently overrides mock data if backend is live
    api.get("/api/dashboard/summary")
      .then((res) => { setData(res) })
      .catch(() => { /* keep mock data */ })

    // Click outside dropdowns listener
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef1.current && !dropdownRef1.current.contains(event.target as Node)) {
        setShowEarningsDropdown(false)
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleRunAnalysis = () => {
    setAnalyzing(true)
    showToast("Running AI Revenue Analytics model...", "info")
    
    setTimeout(() => {
      setAnalyzing(false)
      showToast("Revenue Analytics updated: Customer responses are 18% faster this week!", "success")
    }, 2500)
  }

  const handleSendAiMessage = (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault()
    const query = (textOverride || chatInput).trim()
    if (!query) return

    setChatMessages(prev => [...prev, { sender: "user", text: query }])
    setChatInput("")
    setAiTyping(true)

    // Hit the server draft generator or custom response
    api.post("/api/ai/draft", { goal: query, segment: "all", channel: "email" })
      .then((res: { draft: string }) => {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            sender: "ai", 
            text: res.draft || "Draft generated! Check your Campaigns composer to dispatch." 
          }])
          setAiTyping(false)
        }, 1200)
      })
      .catch(() => {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            sender: "ai", 
            text: "I am ready to help optimize your workspace channels. Ask me to draft follow-ups or analyze segments." 
          }])
          setAiTyping(false)
        }, 1000)
      })
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <PageHeader title="Hey, Need help?" subtitle="Just ask me anything!" showCalendarAndMic={true} />
        <div className="grid grid-cols-3 gap-6 h-[120px]">
          <Skeleton className="rounded-[2rem] h-full" />
          <Skeleton className="rounded-[2rem] h-full" />
          <Skeleton className="rounded-[2rem] h-full" />
        </div>
        <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-start">
          <Skeleton className="flex-1 rounded-[2.5rem] h-[400px] w-full" />
          <Skeleton className="w-full md:w-[380px] rounded-[2.5rem] h-[400px]" />
        </div>
      </div>
    )
  }

  const { metrics } = data

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Welcome PageHeader Banner */}
      <PageHeader 
        title="Hey, Need help?" 
        subtitle="Just ask me anything!" 
        showCalendarAndMic={true} 
      />

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-7">
        {/* Clients Card */}
        <Card className="p-7 rounded-[2.5rem] border border-subtle bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Clients</span>
            <Badge className="bg-[#e6f4ea] text-[#1e8e3e] font-bold rounded-full text-[10px] px-3.5 py-0.5 hover:bg-[#e6f4ea] border-none">
              {metrics.clientsComparison ?? "+4"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none text-primary">{metrics.clients ?? metrics.customers ?? 14}</span>
            <span className="text-[11.5px] text-muted font-semibold">{metrics.clientsSubtitle ?? "Compare 10 (last month)"}</span>
          </div>
        </Card>

        {/* Revenue Card */}
        <Card className="p-7 rounded-[2.5rem] border border-subtle bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Revenue</span>
            <Badge className="bg-[#fce8e6] text-[#c5221f] font-bold rounded-full text-[10px] px-3.5 py-0.5 hover:bg-[#fce8e6] border-none">
              {metrics.revenueComparison ?? "-8%"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none text-primary">
              ${(metrics.revenue ?? 3552).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11.5px] text-muted font-semibold">{metrics.revenueSubtitle ?? "$3,720.00 (last month)"}</span>
          </div>
        </Card>

        {/* Projects Card */}
        <Card className="p-7 rounded-[2.5rem] border border-subtle bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Projects</span>
            <Badge className="bg-[#e6f4ea] text-[#1e8e3e] font-bold rounded-full text-[10px] px-3.5 py-0.5 hover:bg-[#e6f4ea] border-none">
              {metrics.projectsComparison ?? "+6"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none text-primary">{metrics.projects ?? 22}</span>
            <span className="text-[11.5px] text-muted font-semibold">{metrics.projectsSubtitle ?? "Compare 16 (last month)"}</span>
          </div>
        </Card>
      </div>

      {/* Row 2: Main Grid Layout */}
      <div className="flex flex-col xl:flex-row gap-5 md:gap-7 items-stretch">
        
        {/* Left Side: Revenue Analytics (2/3 width) */}
        <Card className="flex-1 p-5 md:p-8 rounded-[2.5rem] border border-subtle bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between min-w-0 xl:min-w-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-bold text-[18px] text-primary">Revenue Analytics</h3>
              <p className="text-[12px] text-muted font-semibold mt-1">Earnings and projected performance comparisons.</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Earnings dropdown */}
              <div className="relative" ref={dropdownRef1}>
                <button 
                  onClick={() => setShowEarningsDropdown(!showEarningsDropdown)}
                  className="flex items-center gap-1.5 text-[11px] font-bold border border-subtle px-3 py-1.5 rounded-full text-primary bg-background/50 hover:bg-background transition-colors"
                >
                  {selectedEarningType} <ChevronDown size={12} strokeWidth={2.5} className="text-muted" />
                </button>
                {showEarningsDropdown && (
                  <div className="absolute right-0 mt-1 bg-surface border border-subtle shadow-md rounded-[1.2rem] py-2 w-[110px] z-30 overflow-hidden">
                    {["Earnings", "Payouts", "Tips"].map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedEarningType(t)
                          setShowEarningsDropdown(false)
                        }}
                        className="w-full text-center py-1.5 text-[11px] font-bold hover:bg-background text-primary"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Period dropdown */}
              <div className="relative" ref={dropdownRef2}>
                <button 
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="flex items-center gap-1.5 text-[11px] font-bold border border-subtle px-3 py-1.5 rounded-full text-primary bg-background/50 hover:bg-background transition-colors"
                >
                  {selectedPeriod} <ChevronDown size={12} strokeWidth={2.5} className="text-muted" />
                </button>
                {showPeriodDropdown && (
                  <div className="absolute right-0 mt-1 bg-surface border border-subtle shadow-md rounded-[1.2rem] py-2 w-[130px] z-30 overflow-hidden">
                    {["Last 7 Days", "Last 30 Days", "Last Quarter"].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setSelectedPeriod(p)
                          setShowPeriodDropdown(false)
                        }}
                        className="w-full text-center py-1.5 text-[11px] font-bold hover:bg-background text-primary"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => showToast("Exporting data as CSV...", "success")}
                className="w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-muted hover:text-primary bg-background/50 hover:bg-background transition-colors shadow-sm"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Chart Core Area */}
          <div className="flex-1 flex flex-col justify-end min-h-[200px] mb-6 border-b border-subtle/40 pb-4 relative">
            
            {/* Chart Legend */}
            <div className="flex gap-4 items-center mb-6 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="text-muted">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-accent"></span>
                <span className="text-muted">AI Projected</span>
              </div>
            </div>

            {/* Custom SVG dotted bars chart */}
            <div className={`h-[150px] w-full flex items-end justify-between px-6 transition-opacity duration-300 ${analyzing ? 'opacity-40' : 'opacity-100'}`}>
              {[
                { date: "Mar 1", actualHeight: "65px", projHeight: "75px" },
                { date: "Mar 10", actualHeight: "85px", projHeight: "95px" },
                { date: "Mar 14", actualHeight: "115px", projHeight: "130px" },
                { date: "Mar 20", actualHeight: "90px", projHeight: "105px" },
                { date: "Mar 31", actualHeight: "105px", projHeight: "125px" }
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group relative">
                  
                  {/* Values popup on hover */}
                  <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-[#121212] text-white text-[10px] px-2.5 py-1.5 rounded-lg z-20 font-bold whitespace-nowrap">
                    <span>Act: {bar.actualHeight.replace('px', '$')}</span>
                    <span>Proj: {bar.projHeight.replace('px', '$')}</span>
                  </div>

                  <div className="flex items-end gap-3.5 h-[130px]">
                    {/* Actual Bar (solid/dotted) */}
                    <div 
                      style={{ height: bar.actualHeight }} 
                      className="w-4 bg-[#10b981] rounded-t-sm hover:opacity-80 transition-all shadow-sm"
                    />

                    {/* AI Projected Bar (dotted stroke border) */}
                    <div 
                      style={{ height: bar.projHeight }}
                      className="w-4 border-2 border-dashed border-accent hover:border-solid rounded-t-sm bg-accent/5 transition-all"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-muted mt-1">{bar.date}</span>
                </div>
              ))}
            </div>

            {/* Grid overlay when analyzing */}
            {analyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                <Sparkles className="w-10 h-10 text-accent animate-spin" />
              </div>
            )}
          </div>

          {/* Insights CTA block */}
          <div className="flex flex-col sm:flex-row gap-6 items-center bg-[#fdfdfd] border border-subtle p-5 rounded-[2rem] shadow-inner mt-2">
            <p className="text-[12.5px] text-[#1a1c20] font-semibold flex-1 leading-relaxed">
              Better client communication can boost tips and repeat work. Try faster responses and follow-ups!
            </p>
            <Button 
              variant="salmon" 
              className="h-10 px-6 rounded-full font-bold text-[12px] shadow-sm w-full sm:w-auto shrink-0 flex items-center gap-1.5"
              onClick={handleRunAnalysis}
              disabled={analyzing}
            >
              <Play size={11} className="fill-current mt-[1px]" /> Run Analysis
            </Button>
          </div>
        </Card>

        {/* Right Side: Task Queue & Chat Helper (1/3 width) */}
        <div className="w-full xl:w-[380px] flex flex-col gap-7 shrink-0">
          
          {/* Priority Tasks List Card */}
          <Card className="p-6 rounded-[2.5rem] border border-subtle bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col h-[270px]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-[15px] text-primary">Priority tasks</h3>
              <Link to="/projects" className="text-[11px] font-bold text-accent hover:underline flex items-center gap-0.5">
                See all <ArrowRight size={10} className="mt-[1px]" />
              </Link>
            </div>

            {/* Task list container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {[
                { title: "Follow-ups", desc: "AI reminders for client follow-ups and check-ins.", date: "Apr 1", badge: "3/4 completed", completed: false },
                { title: "Contract Review", desc: "AI review and approval of contracts.", date: "Apr 1", badge: "1/2 completed", completed: false },
                { title: "Invoices", desc: "Notify customers about payment status.", date: "Apr 2", badge: "1/5 paid", completed: false },
                { title: "View new offers", desc: "A quick response to an offer increases trust.", date: "Apr 2", badge: "3/4 completed", completed: true }
              ].map((task, idx) => (
                <div 
                  key={idx} 
                  onClick={() => showToast(`Task details: ${task.title}`, "info")}
                  className="flex gap-3.5 p-3.5 border border-subtle bg-[#fcfcfc] rounded-2xl hover:border-accent/15 hover:shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all items-start cursor-pointer text-left"
                >
                  <div className="mt-0.5 shrink-0 text-muted hover:text-accent">
                    <CheckSquare size={16} className={task.completed ? "text-[#1e8e3e]" : ""} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-[12.5px] text-primary truncate leading-tight">{task.title}</h4>
                      <span className="text-[10px] text-muted font-bold whitespace-nowrap">{task.date}</span>
                    </div>
                    <p className="text-[11px] text-muted font-semibold mt-1 leading-normal truncate">{task.desc}</p>
                    <div className="mt-2.5">
                      <span className="inline-block bg-[#fae9e6]/60 border border-[#fae9e6] text-accent text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {task.badge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Chat Widget */}
          <Card className="p-6 rounded-[2.5rem] border border-subtle bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col h-[320px] justify-between relative overflow-hidden">
            
            {/* Header info */}
            <div className="shrink-0 mb-3 text-left">
              <h4 className="font-bold text-[14px] text-primary flex items-center gap-1.5">
                Hi, Adam 👋 <span className="text-[11.5px] text-muted font-medium">How can I help you?</span>
              </h4>
              
              {/* AI Tabs */}
              <div className="flex gap-3 border-b border-subtle/60 mt-3 pb-2 text-[10.5px] font-bold">
                {(["LoopAI", "GPT Chat", "Deep Seek"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveAiTab(tab)
                      showToast(`AI agent switched to ${tab}!`, "success")
                    }}
                    className={`pb-1 px-1 border-b-2 transition-all 
                      ${activeAiTab === tab 
                        ? 'border-accent text-accent' 
                        : 'border-transparent text-muted hover:text-primary'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-left">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] 
                      ${msg.sender === 'user' ? 'bg-[#121212] text-white' : 'bg-[#fae9e6] text-accent'}`}>
                      {msg.sender === 'user' ? <User size={10} /> : <Sparkles size={10} className="fill-current" />}
                    </div>
                    <div className={`px-3 py-2 rounded-xl text-[11.5px] font-semibold leading-normal shadow-sm
                      ${msg.sender === 'user' ? 'bg-[#121212] text-white rounded-tr-none' : 'bg-[#f6f8fb] text-primary border border-subtle rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#fae9e6] text-accent flex items-center justify-center shrink-0">
                    <Sparkles size={10} className="animate-spin" />
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-[#f6f8fb] text-muted text-[11px] font-bold rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>

            {/* Prompts chips row */}
            <div className="flex gap-2 mb-3 overflow-x-auto py-1 shrink-0 scrollbar-none">
              {[
                { label: "Text Assistance", color: "bg-[#10b981]", prompt: "Draft a follow-up for Sophie Turner" },
                { label: "Process Automation", color: "bg-[#c5221f]", prompt: "Auto segment WhatsApp Fans" },
                { label: "Schedule Opt", color: "bg-[#ec5c48]", prompt: "Create a calendar newsletter plan" },
                { label: "Smart Response", color: "bg-pink-400", prompt: "Explain conversion stats" }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiMessage(undefined, chip.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fdfdfd] hover:bg-background border border-subtle rounded-full text-[10px] font-bold text-primary shadow-sm text-left shrink-0 transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${chip.color}`} />
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendAiMessage} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-[#fdfdfd] border border-subtle h-10 px-4 rounded-full text-[11.5px] font-bold outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary"
              />
              <Button 
                type="submit" 
                variant="salmon" 
                className="w-10 h-10 rounded-full shadow-sm shrink-0 p-0 flex items-center justify-center bg-[#121212] hover:bg-black text-white border-none"
                disabled={!chatInput.trim() || aiTyping}
              >
                <Send size={11} className="ml-[1px]" />
              </Button>
            </form>
          </Card>

        </div>
      </div>
    </div>
  )
}
