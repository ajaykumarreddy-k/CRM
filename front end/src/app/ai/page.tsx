import { useState, useEffect, useRef } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { api } from "@/src/lib/api"
import { Link, useSearchParams } from "react-router-dom"
import { Send, Sparkles, User, Search, RefreshCw, ArrowRight } from "lucide-react"
import { showToast } from "@/src/lib/toast"

export default function AIChat() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string, rules?: any[]}[]>([
    { role: 'assistant', content: 'Hi, Need help? Just ask me anything. I can draft messages or find specific segments for you.' }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const askAI = async (text: string) => {
    if (!text.trim()) return
    const userMsg = text.trim()
    
    // Optimistic user update
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput("")
    setLoading(true)

    try {
      if (userMsg.toLowerCase().includes("segment") || userMsg.toLowerCase().includes("find") || userMsg.toLowerCase().includes("rule")) {
        const res = await api.post("/api/ai/segment", { text: userMsg })
        setMessages(prev => [...prev, { role: 'assistant', content: '✅ Here are the dynamic segment criteria generated from your prompt:', rules: res.rules }])
        showToast("AI segment rules successfully built!", "success")
      } else {
        const res = await api.post("/api/ai/draft", { goal: userMsg, segment: "all", channel: "email" })
        setMessages(prev => [...prev, { role: 'assistant', content: res.draft }])
        showToast("AI copy draft created!", "success")
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error drafting right now.' }])
      showToast("Assistant failed to process prompt.", "error")
    }
    setLoading(false)
  }

  // Pre-fill prompt on mount if provided in URL
  useEffect(() => {
    const promptParam = searchParams.get("prompt")
    if (promptParam) {
      askAI(decodeURIComponent(promptParam))
    }
  }, [searchParams])

  const handleRefine = (rules: any[]) => {
    const serialized = JSON.stringify(rules)
    setInput(`Refine these criteria: ${serialized} but make it `)
    inputRef.current?.focus()
    showToast("Prompt pre-filled for refinement.", "info")
  }

  return (
    <div className="max-w-[1000px] mx-auto h-[calc(100vh-140px)] flex flex-col pb-6">
      <PageHeader title="AI Assistant" subtitle="Creative companion for your workspace." />
      
      <Card className="flex-1 flex flex-col p-0 bg-surface border border-subtle overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-[#121212] text-white' : 'bg-surface border border-subtle text-accent'}`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 fill-current" />}
              </div>
              
              <div className={`flex flex-col gap-3 ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className={`px-7 py-5 rounded-[2rem] text-[16px] leading-relaxed font-semibold ${m.role === 'user' ? 'bg-[#121212] text-white rounded-tr-lg shadow-md' : 'bg-[#f6f8fb] border border-subtle text-primary rounded-tl-lg'}`}>
                  {m.content}
                </div>
                
                {/* Rules specific action panel */}
                {m.rules && m.rules.length > 0 && (
                  <div className="bg-surface border border-subtle shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[2rem] p-7 w-full mt-2 space-y-4">
                    <pre className="text-muted font-mono text-[14px] whitespace-pre-wrap font-bold bg-[#f6f8fb] p-5 rounded-[1.5rem] border border-subtle/50">
                      {JSON.stringify(m.rules, null, 2)}
                    </pre>
                    <div className="flex gap-3">
                      <Link to={`/segments/new?rules=${encodeURIComponent(JSON.stringify(m.rules))}`}>
                        <Button size="default" variant="salmon" className="px-6 text-[14px] shadow-sm font-bold rounded-full h-11">
                          Apply Rules
                        </Button>
                      </Link>
                      <Button 
                        size="default" 
                        variant="outline" 
                        className="px-6 text-[14px] border-subtle font-bold rounded-full h-11"
                        onClick={() => handleRefine(m.rules || [])}
                      >
                        Refine criteria
                      </Button>
                    </div>
                  </div>
                )}

                {/* Draft specific action panel */}
                {m.role === 'assistant' && i > 0 && !m.rules && (
                  <div className="mt-1">
                    <Link to={`/campaigns/new?message=${encodeURIComponent(m.content)}`}>
                      <Button variant="outline" className="h-10 px-5 rounded-full text-[12px] font-bold border-accent/20 text-accent bg-[#fae9e6]/20 hover:bg-[#fae9e6]/50 flex gap-2 items-center">
                        Create Campaign with Draft <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                )}

              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-full bg-surface border border-subtle shadow-sm flex items-center justify-center text-accent">
                <Sparkles className="w-5 h-5 animate-pulse fill-current" />
              </div>
              <div className="px-7 py-5 rounded-[2rem] bg-[#f6f8fb] text-muted rounded-tl-lg flex gap-2.5 items-center h-[64px]">
                <span className="w-2 h-2 rounded-full bg-[#9ca3af] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#9ca3af] animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-[#9ca3af] animate-pulse delay-150" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-surface border-t border-subtle relative z-10 shrink-0">
          <form className="flex gap-4 max-w-[800px] mx-auto w-full" onSubmit={e => { e.preventDefault(); askAI(input) }}>
            <div className="relative flex-1 group shadow-[0_2px_15px_rgba(0,0,0,0.03)] rounded-full">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                ref={inputRef}
                value={input} 
                onChange={e => setInput(e.target.value)}
                placeholder="Just ask me anything! Try 'Create a welcome message'..." 
                className="w-full bg-[#fdfdfd] border-2 border-subtle h-16 pl-[3.5rem] pr-6 text-[16px] font-semibold rounded-full focus:bg-surface focus:border-subtle focus:shadow-sm outline-none transition-all placeholder:text-muted text-primary"
              />
            </div>
            <Button type="submit" variant="salmon" className="h-16 w-16 shrink-0 rounded-full shadow-md p-0" disabled={!input.trim() || loading}>
              <Send className="w-6 h-6 ml-1" />
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-3 mt-5 max-w-[800px] mx-auto w-full px-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-background h-[36px] px-5 font-bold text-muted hover:text-primary transition-colors text-[13px] rounded-full shadow-sm" onClick={() => askAI("Find lapsed buyers who spent > $100")}>🎯 Find lapsed buyers</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-background h-[36px] px-5 font-bold text-muted hover:text-primary transition-colors text-[13px] rounded-full shadow-sm" onClick={() => askAI("Draft a welcome message for new users")}>✍️ Draft welcome message</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
