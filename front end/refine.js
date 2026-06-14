const fs = require('fs');

fs.writeFileSync('src/index.css', `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --color-google-blue: #4285F4;
  --color-google-red: #EA4335;
  --color-google-yellow: #FBBC05;
  --color-google-green: #34A853;
}

body {
  background-color: #000;
  color: #ededed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: rgba(255, 255, 255, 0.2);
}

.google-text-gradient {
  background: linear-gradient(90deg, var(--color-google-blue), var(--color-google-red), var(--color-google-yellow), var(--color-google-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.google-border-gradient {
  position: relative;
}
.google-border-gradient::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(90deg, var(--color-google-blue), var(--color-google-red), var(--color-google-yellow), var(--color-google-green));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

/* Vercel-like scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #444;
}
`);

const uiButton = `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "google", size?: "default" | "sm" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-white text-black hover:bg-neutral-200": variant === "default",
            "border border-neutral-800 bg-black hover:bg-neutral-900 text-neutral-100": variant === "outline",
            "hover:bg-neutral-900 text-neutral-200": variant === "ghost",
            "bg-white text-black hover:bg-neutral-200 google-border-gradient": variant === "google",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
`;
fs.writeFileSync('src/components/ui/button.tsx', uiButton);

const uiCard = `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-neutral-800 bg-[#000] text-neutral-100 shadow-sm transition-colors overflow-hidden relative", className)} >
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/20 to-transparent pointer-events-none" />
    <div className="relative z-10">{props.children}</div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-base font-semibold leading-none tracking-tight text-neutral-100", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
`;
fs.writeFileSync('src/components/ui/card.tsx', uiCard);

const uiInput = `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-100",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
`;
fs.writeFileSync('src/components/ui/input.tsx', uiInput);

const uiBadge = `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "danger" | "google" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
          {
            "border-neutral-800 bg-neutral-900 text-neutral-100": variant === "default",
            "border-green-500/20 bg-green-500/10 text-green-400": variant === "success",
            "border-yellow-500/20 bg-yellow-500/10 text-yellow-500": variant === "warning",
            "border-red-500/20 bg-red-500/10 text-red-500": variant === "danger",
            "border-transparent bg-white text-black": variant === "google",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
`;
fs.writeFileSync('src/components/ui/badge.tsx', uiBadge);

const topbar = `export function Topbar() {
  return (
    <header className="h-14 border-b border-neutral-800 bg-[#000] flex items-center px-6 sticky top-0 z-10 w-full shrink-0">
      <div className="flex-1 flex items-center gap-3 text-sm text-neutral-400">
        <span className="flex items-center gap-2 text-neutral-200">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">U</span>
          ajayphotos26
        </span>
        <span className="text-neutral-700">/</span>
        <span className="text-neutral-100 font-medium">xeno-crm</span>
        <span className="px-1.5 py-0.5 rounded-full border border-neutral-800 bg-neutral-900 text-[10px] font-medium text-neutral-300">Default</span>
      </div>
    </header>
  )
}
`;
fs.writeFileSync('src/components/layout/Topbar.tsx', topbar);

const sidebar = `import { Link, useLocation } from "react-router-dom"
import { Home, Users, PieChart, Send, Bot } from "lucide-react"

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 border-r border-neutral-800 bg-[#000] flex flex-col h-full flex-shrink-0">
      <div className="p-4 px-6 mt-2 mb-4">
        <h1 className="text-lg tracking-tight text-white flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-white flex items-center justify-center text-xs google-text-gradient font-black">X</span>
          <span className="font-semibold text-neutral-100">XENO</span>
        </h1>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        <NavItem to="/" icon={<Home className="w-4 h-4" />} label="Overview" active={location.pathname === "/"} />
        <NavItem to="/customers" icon={<Users className="w-4 h-4" />} label="Customers" active={location.pathname.startsWith("/customers")} />
        <NavItem to="/segments" icon={<PieChart className="w-4 h-4" />} label="Segments" active={location.pathname.startsWith("/segments")} />
        <NavItem to="/campaigns" icon={<Send className="w-4 h-4" />} label="Campaigns" active={location.pathname.startsWith("/campaigns")} />
        <NavItem to="/ai" icon={<Bot className="w-4 h-4" />} label="AI Chat" active={location.pathname.startsWith("/ai")} />
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-neutral-900 cursor-pointer transition-colors text-sm text-neutral-400">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">U</div>
          <div className="flex-1 truncate">ajayphotos26</div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={\`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors \${active ? "bg-neutral-900 text-neutral-100" : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"}\`}>
      {icon}
      {label}
    </Link>
  )
}
`;
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

const pageHeader = `import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
`;
fs.writeFileSync('src/components/layout/PageHeader.tsx', pageHeader);


fs.writeFileSync('src/app/dashboard/page.tsx', `import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { api } from "@/src/lib/api"
import { Badge } from "@/src/components/ui/badge"

export default function Dashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get("/api/dashboard/summary").then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="p-12 text-neutral-500 animate-pulse text-sm">Loading overview metrics...</div>

  return (
    <div className="max-w-5xl mx-auto p-8">
      <PageHeader title="Overview" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Customers" value={data.metrics.customers} />
        <StatCard title="Active Campaigns" value={data.metrics.campaigns} />
        <StatCard title="Total Sent" value={data.metrics.sent} />
        <StatCard title="Avg. Conversion Rate" value={\`\${data.metrics.cvr}%\`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {data.recentCampaigns.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-md hover:bg-neutral-900 transition-colors -mx-3">
                  <div>
                    <div className="font-medium text-neutral-200 text-sm">{c.name}</div>
                    <div className="text-[13px] text-neutral-500 flex items-center gap-2 mt-0.5">
                      <span>{c.segment}</span>
                      <span className="text-neutral-700">·</span>
                      <Badge variant={c.status === "Sent" ? "success" : "default"}>{c.status}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-400 font-mono">
                    {c.sent} sent
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.feed.map((f: any) => (
                <div key={f.id} className="flex gap-3 relative">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-600 shrink-0 relative z-10" />
                  <div className="absolute top-3 left-[3px] bottom-[-16px] w-[1px] bg-neutral-800" />
                  <div>
                    <p className="text-sm text-neutral-300">{f.text}</p>
                    <p className="text-xs text-neutral-500 mt-1">{f.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-medium text-neutral-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-neutral-100">{value}</div>
      </CardContent>
    </Card>
  )
}
`);


fs.writeFileSync('src/app/campaigns/new/page.tsx', `import { useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { useNavigate } from "react-router-dom"
import { api } from "@/src/lib/api"
import { Sparkles, ArrowRight } from "lucide-react"

export default function NewCampaign() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ name: "", channel: "", segment: "", message: "" })
  const navigate = useNavigate()

  const [aiDraftLoading, setAiDraftLoading] = useState(false)

  const handleDraft = async () => {
    setAiDraftLoading(true)
    try {
      const res = await api.post("/api/ai/draft", {
        goal: "Engage users with a special offer",
        segment: data.segment || "Customers",
        channel: data.channel || "Email"
      })
      setData(prev => ({ ...prev, message: res.draft }))
    } catch(e) {
      console.error(e)
    }
    setAiDraftLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-8 pb-32">
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <span className="hover:text-neutral-300 cursor-pointer transition-colors" onClick={() => navigate('/campaigns')}>Campaigns</span>
        <span>/</span>
        <span className="text-neutral-200">New Campaign</span>
      </div>
      <PageHeader title="Create Campaign" />
      
      <div className="flex gap-2 mb-8">
        {[1,2,3,4].map(s => (
          <div key={s} className={\`h-1 flex-1 rounded-full overflow-hidden bg-neutral-900\`}>
            <div className={\`h-full bg-neutral-100 transition-all duration-300 \${s <= step ? 'w-full' : 'w-0'}\`} />
          </div>
        ))}
      </div>

      <Card className={step === 3 ? "google-border-gradient" : ""}>
        {step === 1 && (
          <div className="p-8 space-y-6">
            <h2 className="text-lg font-medium text-neutral-100 mb-4">Choose Channel</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Email', 'SMS', 'WhatsApp', 'RCS'].map(ch => (
                <button 
                  key={ch} 
                  className={\`p-5 rounded-lg border text-left transition-all \${data.channel === ch ? 'border-neutral-400 bg-neutral-900 text-white' : 'border-neutral-800 bg-black text-neutral-400 hover:border-neutral-600'}\`}
                  onClick={() => setData(prev => ({ ...prev, channel: ch }))}
                >
                  <div className="font-medium">{ch}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-6">
            <h2 className="text-lg font-medium text-neutral-100 mb-4">Select Audience</h2>
            <div className="space-y-3">
              {['Active Buyers', 'Lapsed Customers', 'All Users'].map(seg => (
                <button 
                  key={seg} 
                  className={\`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between \${data.segment === seg ? 'border-neutral-400 bg-neutral-900 text-white' : 'border-neutral-800 bg-black text-neutral-400 hover:border-neutral-600'}\`}
                  onClick={() => setData(prev => ({ ...prev, segment: seg }))}
                >
                  <div className="font-medium text-sm">{seg}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="relative z-10 bg-[#000] rounded-xl flex flex-col h-[400px]">
             <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
              <h2 className="text-lg font-medium text-neutral-100">Compose Message</h2>
              <Button size="sm" variant="outline" onClick={handleDraft} disabled={aiDraftLoading} className="google-text-gradient bg-black border-neutral-800 hover:bg-neutral-900 flex gap-1.5 border-dashed hover:border-solid hover:border-neutral-600">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-neutral-200 font-medium">{aiDraftLoading ? "Generating..." : "AI Draft"}</span>
              </Button>
            </div>
            <textarea
              className="w-full flex-1 bg-transparent border-0 p-6 text-neutral-200 focus:outline-none focus:ring-0 resize-none text-sm leading-relaxed placeholder:text-neutral-600"
              placeholder="Write your message here..."
              value={data.message}
              onChange={e => setData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        )}

        {step === 4 && (
          <div className="p-8 space-y-8">
            <h2 className="text-lg font-medium text-neutral-100">Review & Send</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 border-b border-neutral-800 pb-5">
                <div className="col-span-1 text-neutral-500 text-sm">Channel</div>
                <div className="col-span-2 text-neutral-200 font-medium text-sm">{data.channel}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-neutral-800 pb-5">
                <div className="col-span-1 text-neutral-500 text-sm">Segment</div>
                <div className="col-span-2 text-neutral-200 font-medium text-sm">{data.segment}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-neutral-500 text-sm">Message</div>
                <div className="col-span-2 text-neutral-300 whitespace-pre-wrap text-[13px] leading-relaxed p-4 bg-neutral-900 rounded-md border border-neutral-800">{data.message}</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-neutral-800 flex justify-between bg-neutral-950 rounded-b-xl relative z-10">
          <Button 
             variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button 
            onClick={() => {
              if (step < 4) setStep(s => s + 1)
              else navigate("/campaigns")
            }}
            disabled={(step===1 && !data.channel) || (step===2 && !data.segment) || (step===3 && !data.message)}
          >
            {step === 4 ? "Schedule Campaign" : (
              <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
`);

fs.writeFileSync('src/app/ai/page.tsx', `import { useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { api } from "@/src/lib/api"
import { Send, Sparkles, User } from "lucide-react"

export default function AIChat() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string, rules?: any[]}[]>([
    { role: 'assistant', content: 'Hi, I am XENO Assistant. I can help you draft messages or create segments.' }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const askAI = async (text: string) => {
    if (!text.trim()) return
    const userMsg = text.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput("")
    setLoading(true)

    try {
      if (userMsg.toLowerCase().includes("segment") || userMsg.toLowerCase().includes("find") || userMsg.toLowerCase().includes("rule")) {
        const res = await api.post("/api/ai/segment", { text: userMsg })
        setMessages(prev => [...prev, { role: 'assistant', content: 'Here are the segment rules I generated:', rules: res.rules }])
      } else {
        const res = await api.post("/api/ai/draft", { goal: userMsg, segment: "all", channel: "email" })
        setMessages(prev => [...prev, { role: 'assistant', content: res.draft }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Is your API key configured?' }])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 h-[calc(100vh-3.5rem)] flex flex-col">
      <PageHeader title="AI Assistant" subtitle="Create segments or draft messages naturally." />
      
      <Card className="flex-1 flex flex-col min-h-0 bg-[#000] border-neutral-800 relative p-px google-border-gradient overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 bg-[#000] rounded-[11px]">
          {messages.map((m, i) => (
            <div key={i} className={\`flex gap-4 \${m.role === 'user' ? 'flex-row-reverse' : ''}\`}>
              <div className={\`w-8 h-8 rounded-full flex shrink-0 items-center justify-center border \${m.role === 'user' ? 'bg-white text-black border-transparent' : 'bg-neutral-900 text-neutral-100 border-neutral-800'}\`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={\`flex flex-col gap-2 \${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]\`}>
                <div className={\`px-4 py-3 rounded-2xl text-[13px] leading-relaxed \${m.role === 'user' ? 'bg-neutral-100 text-black rounded-tr-none' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'}\`}>
                  {m.content}
                </div>
                {m.rules && m.rules.length > 0 && (
                  <div className="bg-black border border-neutral-800 rounded-lg p-4 w-full text-sm">
                    <pre className="text-neutral-400 font-mono text-[11px] whitespace-pre-wrap">{JSON.stringify(m.rules, null, 2)}</pre>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="border-neutral-800 hover:bg-neutral-900 text-xs h-7">Use these rules</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 rounded-tl-none max-w-[80%] flex gap-1.5 items-center h-[46px]">
                <span className="w-1 h-1 rounded-full bg-neutral-500 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-neutral-500 animate-pulse delay-75" />
                <span className="w-1 h-1 rounded-full bg-neutral-500 animate-pulse delay-150" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 rounded-b-[11px] relative z-10 shrink-0">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); askAI(input) }}>
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="bg-black border-neutral-800 h-10 text-sm rounded-md hover:border-neutral-700 transition-colors placeholder:text-neutral-600"
            />
            <Button type="submit" className="h-10 w-10 shrink-0 border border-neutral-800 bg-black hover:bg-neutral-900 text-white" disabled={!input.trim() || loading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="default" className="cursor-pointer hover:bg-neutral-800 h-6 px-2.5 font-normal text-neutral-400 hover:text-neutral-200 transition-colors text-[11px]" onClick={() => askAI("Find lapsed buyers who spent > $100")}>Find lapsed buyers...</Badge>
            <Badge variant="default" className="cursor-pointer hover:bg-neutral-800 h-6 px-2.5 font-normal text-neutral-400 hover:text-neutral-200 transition-colors text-[11px]" onClick={() => askAI("Draft a welcome message for new users")}>Draft a welcome message...</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
`);


fs.writeFileSync('src/app/customers/page.tsx', `import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { api } from "@/src/lib/api"
import { Customer } from "@/src/types"

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  
  useEffect(() => {
    api.get("/api/customers").then(setCustomers).catch(console.error)
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <PageHeader title="Customers" />
      
      <Card className="overflow-hidden p-0 bg-[#000] border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-xs text-neutral-500 border-b border-neutral-800 bg-neutral-950">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Pref. Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-[#000]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 text-sm">
                    No customers yet. Seed data to begin.
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-neutral-900 transition-colors text-neutral-300">
                    <td className="px-6 py-3.5 font-medium text-neutral-100">{c.name}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{c.email}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{c.phone}</td>
                    <td className="px-6 py-3.5">
                      <ChannelBadge channel={c.channel} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  switch (channel) {
    case "WhatsApp": return <Badge variant="success">{channel}</Badge>;
    case "Email": return <Badge variant="default">{channel}</Badge>;
    case "SMS": return <Badge variant="default" className="text-white bg-neutral-800">{channel}</Badge>;
    case "RCS": return <Badge variant="warning">{channel}</Badge>;
    default: return <Badge variant="default">{channel}</Badge>
  }
}
`);

fs.writeFileSync('src/app/campaigns/page.tsx', `import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { api } from "@/src/lib/api"
import { Campaign } from "@/src/types"
import { Link } from "react-router-dom"
import { Play, Pause, BarChart2 } from "lucide-react"

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    api.get("/api/campaigns").then(setCampaigns).catch(console.error)
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <PageHeader 
        title="Campaigns" 
        action={<Link to="/campaigns/new"><Button variant="default">New Campaign</Button></Link>}
      />

      <Card className="overflow-hidden p-0 bg-[#000] border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-xs text-neutral-500 border-b border-neutral-800 bg-neutral-950">
              <tr>
                <th className="px-6 py-3 font-medium">Campaign Name</th>
                <th className="px-6 py-3 font-medium">Channel</th>
                <th className="px-6 py-3 font-medium">Segment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-[#000]">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500 text-sm">
                    No campaigns yet. Create your first.
                  </td>
                </tr>
              ) : (
                campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-neutral-900 transition-colors text-neutral-300">
                    <td className="px-6 py-3.5 font-medium text-neutral-100">{c.name}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{c.channel}</td>
                    <td className="px-6 py-3.5 text-neutral-400">{c.segment}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={c.status === "Sent" ? "success" : "warning"}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1 text-neutral-500">
                        <Button variant="ghost" size="icon" className="hover:text-neutral-200 h-8 w-8"><BarChart2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-neutral-200 h-8 w-8"><Pause className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
`);

fs.writeFileSync('src/app/segments/page.tsx', `import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { api } from "@/src/lib/api"
import { Segment } from "@/src/types"
import { formatDate } from "@/src/lib/utils"

export default function Segments() {
  const [segments, setSegments] = useState<Segment[]>([])

  useEffect(() => {
    api.get("/api/segments").then(setSegments).catch(console.error)
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <PageHeader 
        title="Segments" 
        action={<Button variant="default">Create Segment</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-900 rounded-lg border border-neutral-800 border-dashed text-sm">
            No segments yet. Create one or ask AI.
          </div>
        ) : (
          segments.map(s => (
            <Card key={s.id} className="hover:border-neutral-600 transition-colors cursor-pointer group hover:bg-neutral-900/50">
              <CardHeader className="pb-3 z-10 relative">
                <CardTitle className="group-hover:text-neutral-100 transition-colors text-neutral-200">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-2xl font-bold text-white tracking-tight">{s.count}</p>
                    <p className="text-xs text-neutral-500 font-medium">Audience size</p>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatDate(s.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
`);
