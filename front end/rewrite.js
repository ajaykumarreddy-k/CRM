const fs = require('fs');

fs.writeFileSync('src/index.css', `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-google-blue: #4285F4;
  --color-google-red: #EA4335;
  --color-google-yellow: #FBBC05;
  --color-google-green: #34A853;
}

body {
  background-color: #000;
  color: #EDEDED;
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

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}`);

fs.writeFileSync('src/App.tsx', `import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Sidebar } from "./components/layout/Sidebar"
import { Topbar } from "./components/layout/Topbar"
import Dashboard from "./app/dashboard/page"
import Customers from "./app/customers/page"
import Segments from "./app/segments/page"
import Campaigns from "./app/campaigns/page"
import NewCampaign from "./app/campaigns/new/page"
import AIChat from "./app/ai/page"

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/segments" element={<Segments />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<NewCampaign />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
`);

fs.writeFileSync('src/components/layout/Sidebar.tsx', `import { Link, useLocation } from "react-router-dom"
import { Home, Users, PieChart, Send, Bot } from "lucide-react"

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col h-full flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-white flex items-center justify-center text-xs google-text-gradient font-black">G</span>
          <span className="google-text-gradient">XENO</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <NavItem to="/" icon={<Home className="w-4 h-4" />} label="Overview" active={location.pathname === "/"} />
        <NavItem to="/customers" icon={<Users className="w-4 h-4" />} label="Customers" active={location.pathname.startsWith("/customers")} />
        <NavItem to="/segments" icon={<PieChart className="w-4 h-4" />} label="Segments" active={location.pathname.startsWith("/segments")} />
        <NavItem to="/campaigns" icon={<Send className="w-4 h-4" />} label="Campaigns" active={location.pathname.startsWith("/campaigns")} />
        <NavItem to="/ai" icon={<Bot className="w-4 h-4" />} label="AI Chat" active={location.pathname.startsWith("/ai")} />
      </nav>
      <div className="p-4 border-t border-white/10 text-xs text-white/40 font-medium">
        Demo Account
      </div>
    </div>
  )
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={\`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 \${active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}\`}>
      {icon}
      {label}
    </Link>
  )
}
`);

fs.writeFileSync('src/components/layout/Topbar.tsx', `export function Topbar() {
  return (
    <header className="h-14 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-10 w-full shrink-0">
      <div className="flex-1 flex items-center gap-2 text-sm text-white/60 font-mono">
        <span className="px-2 py-0.5 rounded pl-1 bg-white/5 text-white/80 border border-white/10 text-xs font-medium font-sans flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500/80 shrink-0 border border-green-400"></span> Workspace</span> <span className="opacity-50">/</span> Default
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
          U
        </div>
      </div>
    </header>
  )
}
`);

fs.writeFileSync('src/components/layout/PageHeader.tsx', `import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">{title}</h1>
        {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
`);

fs.writeFileSync('src/components/ui/button.tsx', `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "google", size?: "default" | "sm" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-white text-black hover:bg-neutral-200": variant === "default",
            "border border-white/20 bg-black hover:bg-white/10 text-white": variant === "outline",
            "hover:bg-white/10 text-white": variant === "ghost",
            "bg-white text-black hover:bg-neutral-200 google-border-gradient": variant === "google",
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 w-10": size === "icon",
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
`);

fs.writeFileSync('src/components/ui/card.tsx', `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-white/10 bg-[#0A0A0A] text-white shadow-sm transition-colors", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
`);

fs.writeFileSync('src/components/ui/badge.tsx', `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "danger" | "google" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
          {
            "border-white/10 bg-white/5 text-white": variant === "default",
            "border-transparent bg-green-500/10 text-green-400": variant === "success",
            "border-transparent bg-yellow-500/10 text-yellow-500": variant === "warning",
            "border-transparent bg-red-500/10 text-red-500": variant === "danger",
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
`);

fs.writeFileSync('src/components/ui/input.tsx', `import * as React from "react"
import { cn } from "@/src/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 text-white",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
`);

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

  if (!data) return <div className="p-12 text-white/40 animate-pulse font-mono text-sm">Loading overview metrics...</div>

  return (
    <div className="max-w-6xl mx-auto p-8">
      <PageHeader title="Overview" subtitle="Metrics and recent activity across your campaigns." />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <div className="space-y-3">
              {data.recentCampaigns.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-white/60 flex items-center gap-2 mt-1">
                      <span>{c.segment}</span>
                      <span>·</span>
                      <Badge variant={c.status === "Sent" ? "success" : "default"}>{c.status}</Badge>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-white/80 font-mono">
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
                <div key={f.id} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />
                  <div>
                    <p className="text-sm text-white/80">{f.text}</p>
                    <p className="text-xs text-white/40 mt-1 font-mono">{f.time}</p>
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
        <CardTitle className="text-sm font-medium text-white/60">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-white mb-1 font-mono">{value}</div>
      </CardContent>
    </Card>
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
    <div className="max-w-6xl mx-auto p-8">
      <PageHeader title="Customers" subtitle="Manage your database of contacts." />
      
      <Card className="overflow-hidden p-0 bg-transparent border-transparent">
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0A0A0A]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/60 border-b border-white/10 bg-[#000] uppercase font-mono">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Pref. Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#0A0A0A]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40 font-mono">
                    No customers yet. Seed data to begin.
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors text-white/80">
                    <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                    <td className="px-6 py-4 text-white/60">{c.email}</td>
                    <td className="px-6 py-4 font-mono text-white/60">{c.phone}</td>
                    <td className="px-6 py-4">
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
    case "WhatsApp": return <Badge variant="success">WhatsApp</Badge>;
    case "Email": return <Badge variant="default">Email</Badge>;
    case "SMS": return <Badge variant="default" className="text-white bg-white/10">SMS</Badge>;
    case "RCS": return <Badge variant="warning">RCS</Badge>;
    default: return <Badge variant="default">{channel}</Badge>
  }
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
    <div className="max-w-6xl mx-auto p-8">
      <PageHeader 
        title="Segments" 
        subtitle="Manage dynamic audiences." 
        action={<Button variant="default">Create Segment</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/40 bg-white/5 rounded-lg border border-white/10 border-dashed font-mono">
            No segments yet. Create one or ask AI.
          </div>
        ) : (
          segments.map(s => (
            <Card key={s.id} className="hover:border-white/30 transition-colors cursor-pointer group">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg group-hover:text-white transition-colors text-white/80">{s.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white font-mono">{s.count}</p>
                    <p className="text-xs text-white/40 font-medium">Audience size</p>
                  </div>
                  <div className="text-xs text-white/40 font-mono">
                    Created {formatDate(s.createdAt)}
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
    <div className="max-w-6xl mx-auto p-8">
      <PageHeader 
        title="Campaigns" 
        subtitle="Manage and track active messaging campaigns." 
        action={<Link to="/campaigns/new"><Button variant="default">New Campaign</Button></Link>}
      />

      <Card className="overflow-hidden p-0 bg-transparent border-transparent">
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0A0A0A]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/60 border-b border-white/10 bg-[#000] uppercase font-mono">
              <tr>
                <th className="px-6 py-4 font-medium">Campaign Name</th>
                <th className="px-6 py-4 font-medium">Channel</th>
                <th className="px-6 py-4 font-medium">Segment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#0A0A0A]">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40 font-mono text-sm">
                    No campaigns yet. Create your first.
                  </td>
                </tr>
              ) : (
                campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors text-white/80">
                    <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                    <td className="px-6 py-4 text-white/60">{c.channel}</td>
                    <td className="px-6 py-4 text-white/60">{c.segment}</td>
                    <td className="px-6 py-4">
                      <Badge variant={c.status === "Sent" ? "success" : "warning"}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-white/40">
                        <Button variant="ghost" size="icon" className="hover:text-white"><BarChart2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="hover:text-white"><Pause className="w-4 h-4" /></Button>
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

fs.writeFileSync('src/app/campaigns/new/page.tsx', `import { useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { useNavigate } from "react-router-dom"
import { api } from "@/src/lib/api"
import { Sparkles } from "lucide-react"

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
      <PageHeader title="Create Campaign" subtitle={\`Step \${step} of 4\`} />
      
      <div className="flex gap-2 mb-8">
        {[1,2,3,4].map(s => (
          <div key={s} className={\`h-1 flex-1 rounded-full overflow-hidden bg-white/10\`}>
            <div className={\`h-full bg-white transition-all duration-300 \${s <= step ? 'w-full' : 'w-0'}\`} />
          </div>
        ))}
      </div>

      <Card className={step === 3 ? "google-border-gradient" : ""}>
        {step === 1 && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-medium text-white mb-4">Choose Channel</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Email', 'SMS', 'WhatsApp', 'RCS'].map(ch => (
                <button 
                  key={ch} 
                  className={\`p-6 rounded-lg border text-left transition-all \${data.channel === ch ? 'border-white bg-white/10 text-white' : 'border-white/10 bg-black text-white/60 hover:border-white/30 hover:bg-white/5'}\`}
                  onClick={() => setData(prev => ({ ...prev, channel: ch }))}
                >
                  <div className="font-semibold text-lg">{ch}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-medium text-white mb-4">Select Audience</h2>
            <div className="grid grid-cols-1 gap-4">
              {['Active Buyers', 'Lapsed Customers', 'All Users'].map(seg => (
                <button 
                  key={seg} 
                  className={\`p-4 rounded-lg border text-left transition-all flex items-center justify-between \${data.segment === seg ? 'border-white bg-white/10 text-white' : 'border-white/10 bg-black text-white/60 hover:border-white/30 hover:bg-white/5'}\`}
                  onClick={() => setData(prev => ({ ...prev, segment: seg }))}
                >
                  <div className="font-semibold">{seg}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 space-y-6 relative z-10 bg-[#0A0A0A] rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">Compose Message</h2>
              <Button size="sm" variant="outline" onClick={handleDraft} disabled={aiDraftLoading} className="google-text-gradient bg-black border-white/20 hover:bg-white/5 flex gap-2 w-auto border-dashed hover:border-solid hover:border-white/50">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white font-semibold">{aiDraftLoading ? "Generating draft..." : "AI Draft"}</span>
              </Button>
            </div>
            <textarea
              className="w-full h-48 bg-black border border-white/10 rounded-md p-4 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 resize-none transition-colors text-sm leading-relaxed"
              placeholder="Write your message here..."
              value={data.message}
              onChange={e => setData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        )}

        {step === 4 && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-medium text-white mb-4">Review & Send</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-4">
                <div className="col-span-1 text-white/40 text-sm">Channel</div>
                <div className="col-span-2 text-white font-medium">{data.channel}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-white/10 pb-4">
                <div className="col-span-1 text-white/40 text-sm">Segment</div>
                <div className="col-span-2 text-white font-medium">{data.segment}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-white/40 text-sm">Message</div>
                <div className="col-span-2 text-white/80 whitespace-pre-wrap text-sm leading-relaxed p-4 bg-white/5 rounded-md border border-white/10">{data.message}</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-white/10 flex justify-between bg-black/50 rounded-b-xl relative z-10">
          <Button 
            variant="ghost" 
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
            {step === 4 ? "Schedule Campaign" : "Continue"}
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
      
      <Card className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A] border-white/10 relative p-1 google-border-gradient">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 bg-[#0A0A0A] rounded-t-[10px]">
          {messages.map((m, i) => (
            <div key={i} className={\`flex gap-4 \${m.role === 'user' ? 'flex-row-reverse' : ''}\`}>
              <div className={\`w-8 h-8 rounded-full flex shrink-0 items-center justify-center border \${m.role === 'user' ? 'bg-white text-black border-transparent' : 'bg-black text-white border-white/20'}\`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={\`flex flex-col gap-2 \${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]\`}>
                <div className={\`p-4 rounded-2xl text-sm leading-relaxed \${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'}\`}>
                  {m.content}
                </div>
                {m.rules && m.rules.length > 0 && (
                  <div className="bg-[#000] border border-white/10 rounded-lg p-4 w-full text-sm">
                    <pre className="text-white/60 font-mono text-xs whitespace-pre-wrap">{JSON.stringify(m.rules, null, 2)}</pre>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">Use these rules</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-black text-white border border-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 rounded-tl-none max-w-[80%] flex gap-1 items-center h-[52px]">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-150" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black rounded-b-[10px] relative z-10">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); askAI(input) }}>
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="bg-white/5 border-white/10 h-12 text-sm rounded-lg hover:border-white/30 transition-colors"
            />
            <Button type="submit" className="h-12 w-12 rounded-lg" disabled={!input.trim() || loading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="default" className="cursor-pointer hover:bg-white/10 h-7 px-3 font-normal text-white/60 hover:text-white transition-colors" onClick={() => askAI("Find lapsed buyers who spent > $100")}>Find lapsed buyers...</Badge>
            <Badge variant="default" className="cursor-pointer hover:bg-white/10 h-7 px-3 font-normal text-white/60 hover:text-white transition-colors" onClick={() => askAI("Draft a welcome message for new users")}>Draft a welcome message...</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
`);
