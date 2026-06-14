import { useState, useEffect } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { useNavigate, useSearchParams } from "react-router-dom"
import { api } from "@/src/lib/api"
import { showToast } from "@/src/lib/toast"
import { Skeleton } from "@/src/components/ui/skeleton"
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react"

export default function NewCampaign() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ name: "", channel: "Email", segment: "", message: "" })
  const [segments, setSegments] = useState<any[] | null>(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [aiDraftLoading, setAiDraftLoading] = useState(false)

  // Fetch actual segments and check URL query params
  useEffect(() => {
    api.get("/api/segments")
      .then(setSegments)
      .catch(err => {
        console.error(err)
        showToast("Failed to fetch target segments", "error")
      })

    const messageParam = searchParams.get("message")
    if (messageParam) {
      setData(prev => ({ 
        ...prev, 
        message: decodeURIComponent(messageParam),
        name: "AI Generated Campaign"
      }))
      setStep(3)
      showToast("Imported message draft from AI chat!", "success")
    }
  }, [searchParams])

  const handleDraft = async () => {
    setAiDraftLoading(true)
    try {
      const res = await api.post("/api/ai/draft", {
        goal: "Engage users with a special offer",
        segment: data.segment || "Customers",
        channel: data.channel || "Email"
      })
      setData(prev => ({ ...prev, message: res.draft }))
      showToast("Generated message draft with AI!", "success")
    } catch(e) {
      console.error(e)
      showToast("AI Draft generation failed.", "error")
    }
    setAiDraftLoading(false)
  }

  const handleSaveCampaign = async () => {
    setSaving(true)
    try {
      await api.post("/api/campaigns", {
        name: data.name,
        channel: data.channel,
        segment: data.segment,
        message: data.message
      })
      showToast(`Campaign "${data.name}" scheduled successfully!`, "success")
      navigate("/campaigns")
    } catch (err) {
      console.error(err)
      showToast("Failed to schedule campaign.", "error")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-[800px] mx-auto pb-32">
      <div className="flex items-center gap-2 text-[15px] font-semibold text-muted mb-4">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/campaigns')}>Campaigns</span>
        <span>/</span>
        <span className="text-primary">Create Campaign</span>
      </div>
      <PageHeader title="New Campaign Wizard" />
      
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="h-1.5 flex-1 rounded-full overflow-hidden bg-surface shadow-sm border border-subtle">
            <div className={`h-full bg-[#121212] transition-all duration-500 ease-out ${s <= step ? 'w-full' : 'w-0'}`} />
          </div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-subtle">
        {step === 1 && (
          <div className="p-10 space-y-8">
            <h2 className="text-[24px] font-bold text-primary">Channel & Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted block mb-2">Campaign Name</label>
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. VIP June Blast Offer" 
                  className="w-full bg-[#fdfdfd] border border-subtle h-12 px-5 text-[15px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary placeholder:text-muted"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted block mb-3">Choose Messaging Channel</label>
                <div className="grid grid-cols-2 gap-5">
                  {['Email', 'SMS', 'WhatsApp', 'RCS'].map(ch => (
                    <button 
                      key={ch} 
                      className={`p-7 rounded-[2rem] border-2 text-left transition-all duration-200 ${data.channel === ch ? 'border-accent bg-[#fce8e6]/50 text-accent' : 'border-subtle bg-background/30 text-muted hover:border-subtle hover:bg-background'}`}
                      onClick={() => setData(prev => ({ ...prev, channel: ch }))}
                    >
                      <div className="font-bold text-[19px]">{ch}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 space-y-8">
            <h2 className="text-[24px] font-bold text-primary">Select Target Audience</h2>
            <div className="space-y-4">
              {segments === null ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-[2rem]" />)
              ) : segments.length === 0 ? (
                <div className="text-center py-10 text-muted font-bold text-[15px] border border-dashed border-subtle rounded-[2rem]">
                  No audiences found. Please create a segment first!
                </div>
              ) : (
                segments.map(seg => (
                  <button 
                    key={seg.id} 
                    className={`w-full p-7 rounded-[2rem] border-2 text-left transition-all duration-200 flex items-center justify-between ${data.segment === seg.name ? 'border-[#121212] bg-[#121212] text-white shadow-lg' : 'border-subtle bg-background/30 text-muted hover:border-subtle hover:bg-background'}`}
                    onClick={() => setData(prev => ({ ...prev, segment: seg.name }))}
                  >
                    <div className="font-bold text-[17px]">{seg.name}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="relative flex flex-col h-[500px]">
            <div className="px-10 py-8 flex justify-between items-center border-b border-subtle">
              <h2 className="text-[24px] font-bold text-primary">Compose Message</h2>
              <Button size="sm" variant="outline" onClick={handleDraft} disabled={aiDraftLoading} className="rounded-full bg-surface border-2 border-[#fce8e6] hover:bg-[#fae9e6] hover:border-accent/50 text-accent flex gap-2 h-11 px-5 shadow-sm transition-all duration-300">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-bold text-[14px]">{aiDraftLoading ? "Generating..." : "AI Draft Assistant"}</span>
              </Button>
            </div>
            <div className="p-10 pt-6 flex-1 flex flex-col">
               <textarea
                 className="w-full flex-1 bg-background/50 border border-subtle rounded-[2rem] p-8 text-primary focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 resize-none text-[17px] font-medium leading-relaxed placeholder:text-muted transition-all"
                 placeholder="Write your message here or use the AI Draft Assistant..."
                 value={data.message}
                 onChange={e => setData(prev => ({ ...prev, message: e.target.value }))}
               />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-10 space-y-10">
            <h2 className="text-[24px] font-bold text-primary">Review & Send</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6 border-b border-subtle pb-6">
                <div className="col-span-1 text-muted font-semibold text-[15px]">Campaign Name</div>
                <div className="col-span-2 text-primary font-bold text-[17px]">{data.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-6 border-b border-subtle pb-6">
                <div className="col-span-1 text-muted font-semibold text-[15px]">Channel</div>
                <div className="col-span-2 text-primary font-bold text-[17px]">{data.channel}</div>
              </div>
              <div className="grid grid-cols-3 gap-6 border-b border-subtle pb-6">
                <div className="col-span-1 text-muted font-semibold text-[15px]">Segment</div>
                <div className="col-span-2 text-primary font-bold text-[17px]">{data.segment}</div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 text-muted font-semibold text-[15px]">Message</div>
                <div className="col-span-2 text-primary whitespace-pre-wrap font-medium text-[16px] leading-relaxed p-7 bg-background/50 rounded-[2rem] border border-subtle">{data.message}</div>
              </div>
            </div>
          </div>
        )}

        <div className="px-10 py-8 border-t border-subtle bg-surface flex justify-between">
          <Button 
            variant="outline"
            className="h-14 px-8 rounded-full border-subtle text-muted font-bold hover:bg-background hover:text-primary text-[15px]"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || saving}
          >
            <ArrowLeft className="w-5 h-5 mr-3" /> Back
          </Button>
          <Button 
            className="h-14 px-10 rounded-full font-bold shadow-md flex gap-2 text-[15px]"
            variant={step === 4 ? "salmon" : "dark"}
            onClick={() => {
              if (step < 4) setStep(s => s + 1)
              else handleSaveCampaign()
            }}
            disabled={
              (step === 1 && (!data.name.trim() || !data.channel)) || 
              (step === 2 && !data.segment) || 
              (step === 3 && !data.message.trim()) ||
              saving
            }
          >
            {saving ? "Scheduling..." : step === 4 ? "Schedule Campaign" : (
              <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
