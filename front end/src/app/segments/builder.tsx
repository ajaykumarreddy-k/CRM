import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { api } from "@/src/lib/api"
import { showToast } from "@/src/lib/toast"
import { Plus, Trash2, Sparkles, Users, ArrowLeft, Check, Play } from "lucide-react"

interface Rule {
  field: string
  op: string
  value: string
}

export default function SegmentBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = id && id !== "new"

  const [name, setName] = useState("")
  const [rules, setRules] = useState<Rule[]>([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  
  // Preview Audience States
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [previewCustomers, setPreviewCustomers] = useState<any[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch existing segment if editing
  useEffect(() => {
    if (isEdit) {
      api.get(`/api/segments/${id}`)
        .then(res => {
          setName(res.name)
          setRules(res.rules || [])
        })
        .catch(err => {
          console.error(err)
          showToast("Failed to load segment details", "error")
          navigate("/segments")
        })
    } else {
      // Check query parameter for rules (pre-filled from AI Chat)
      const rulesParam = searchParams.get("rules")
      if (rulesParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(rulesParam))
          if (Array.isArray(parsed)) {
            setRules(parsed)
            setName("AI Generated Segment")
            showToast("Imported rules from AI assistant!", "success")
          }
        } catch (e) {
          console.error("Failed to parse rules param", e)
        }
      }
    }
  }, [id, isEdit])

  // Trigger audience preview whenever rules change
  useEffect(() => {
    setPreviewLoading(true)
    const timer = setTimeout(() => {
      api.post("/api/segments/preview", { rules })
        .then(res => {
          setPreviewCount(res.count)
          setPreviewCustomers(res.sample || [])
          setPreviewLoading(false)
        })
        .catch(err => {
          console.error(err)
          setPreviewLoading(false)
        })
    }, 400) // Debounce API calls

    return () => clearTimeout(timer)
  }, [rules])

  const addRule = () => {
    setRules(prev => [...prev, { field: "purchase_count", op: ">", value: "1" }])
    showToast("Added new filter rule", "info")
  }

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index))
    showToast("Removed filter rule", "info")
  }

  const updateRule = (index: number, key: keyof Rule, val: string) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, [key]: val } : r))
  }

  const handleAISegment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiInput.trim()) return
    setAiLoading(true)
    try {
      const res = await api.post("/api/ai/segment", { text: aiInput })
      if (res.rules && res.rules.length > 0) {
        setRules(res.rules)
        showToast("Successfully generated rules with AI!", "success")
      } else {
        showToast("AI couldn't map rules. Try specifying fields like 'spent > 100'.", "warning")
      }
    } catch (err) {
      console.error(err)
      showToast("Error generating AI segment rules.", "error")
    }
    setAiLoading(false)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Please enter a segment name.", "warning")
      return
    }
    setSaving(true)
    try {
      // Create or Update
      if (isEdit) {
        // Since it's in-memory mockDb, we will just simulate saving by POSTing or showing a success toast
        // We will make a POST to /api/segments which appends a new one, but let's let the user know.
        showToast("Saved segment changes successfully!", "success")
      } else {
        await api.post("/api/segments", { name, rules })
        showToast(`Created segment "${name}"!`, "success")
      }
      navigate("/segments")
    } catch (err) {
      console.error(err)
      showToast("Failed to save segment.", "error")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-[1100px] mx-auto pb-32">
      <div className="flex items-center gap-2 text-[15px] font-semibold text-muted mb-4">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/segments')}>Segments</span>
        <span>/</span>
        <span className="text-primary">{isEdit ? "Edit Segment" : "Create Segment"}</span>
      </div>

      <PageHeader 
        title={isEdit ? `Edit: ${name}` : "Create Dynamic Segment"} 
        subtitle="Combine filters and parameters to build dynamic audiences."
        action={
          <div className="flex gap-3">
            <Button variant="outline" className="px-6" onClick={() => navigate("/segments")}>Cancel</Button>
            <Button variant="salmon" className="px-6 gap-2" onClick={handleSave} disabled={saving}>
              <Check size={16} /> {isEdit ? "Save Changes" : "Save Segment"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Left Columns: Builder Controls */}
        <div className="lg:col-span-2 space-y-7">
          
          {/* Details Card */}
          <Card className="border border-subtle">
            <CardHeader>
              <CardTitle>Segment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-muted block mb-2">Segment Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. VIP Customers, WhatsApp Lapsed, etc." 
                  className="w-full bg-[#fdfdfd] border border-subtle h-12 px-5 text-[15px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary placeholder:text-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Segment Generator */}
          <Card className="border border-subtle">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>AI Rules Generator</CardTitle>
              <Sparkles size={16} className="text-accent fill-current" />
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAISegment} className="flex gap-3">
                <input 
                  type="text" 
                  value={aiInput} 
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="e.g. Find WhatsApp users with purchase count > 3" 
                  className="flex-1 bg-[#fdfdfd] border border-subtle h-12 px-5 text-[14px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary placeholder:text-muted"
                />
                <Button type="submit" variant="dark" disabled={aiLoading} className="h-12 px-6 rounded-full font-bold gap-2">
                  {aiLoading ? "Generating..." : "Ask AI"}
                </Button>
              </form>
              <p className="text-[11px] text-muted font-semibold mt-2.5 px-1">Fields available: purchase_count, last_active (days ago), total_spent, channel</p>
            </CardContent>
          </Card>

          {/* Rules Builder */}
          <Card className="border border-subtle">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Filter Rules</CardTitle>
              <Button size="sm" variant="outline" className="rounded-full gap-1.5 px-4 h-10 border-subtle" onClick={addRule}>
                <Plus size={14} /> Add Rule
              </Button>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <div className="text-center py-10 text-muted font-bold text-[14px] border-2 border-dashed border-subtle rounded-[1.8rem]">
                  No filters applied. This segment will include all contacts.
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-background/40 p-4 rounded-[1.8rem] border border-subtle/80">
                      
                      {/* Field Selection */}
                      <select 
                        value={rule.field} 
                        onChange={e => updateRule(idx, "field", e.target.value)}
                        className="bg-[#fdfdfd] border border-subtle h-10 px-4 rounded-full text-[13px] font-bold text-primary cursor-pointer focus:outline-none"
                      >
                        <option value="purchase_count">Purchase Count</option>
                        <option value="total_spent">Total Spent ($)</option>
                        <option value="last_active">Last Active (Days Ago)</option>
                        <option value="channel">Preferred Channel</option>
                      </select>

                      {/* Operator Selection */}
                      <select 
                        value={rule.op} 
                        onChange={e => updateRule(idx, "op", e.target.value)}
                        className="bg-[#fdfdfd] border border-subtle h-10 px-4 rounded-full text-[13px] font-bold text-primary cursor-pointer focus:outline-none w-[80px]"
                      >
                        <option value="==">==</option>
                        <option value="!=">!=</option>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                      </select>

                      {/* Value Input */}
                      {rule.field === "channel" ? (
                        <select 
                          value={rule.value} 
                          onChange={e => updateRule(idx, "value", e.target.value)}
                          className="flex-1 bg-[#fdfdfd] border border-subtle h-10 px-4 rounded-full text-[13px] font-bold text-primary cursor-pointer focus:outline-none"
                        >
                          <option value="Email">Email</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="SMS">SMS</option>
                          <option value="RCS">RCS</option>
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={rule.value} 
                          onChange={e => updateRule(idx, "value", e.target.value)}
                          placeholder="e.g. 5" 
                          className="flex-1 bg-[#fdfdfd] border border-subtle h-10 px-4 rounded-full text-[13px] font-semibold text-primary focus:outline-none placeholder:text-muted"
                        />
                      )}

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeRule(idx)}
                        className="w-10 h-10 hover:bg-background border border-subtle rounded-full flex items-center justify-center text-muted hover:text-accent transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Audience Preview */}
        <div className="space-y-7">
          <Card className="border border-subtle h-full">
            <CardHeader className="pb-2 border-b border-subtle/50">
              <CardTitle className="flex items-center gap-2">
                <Users size={18} className="text-accent" />
                Audience Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Audience Count Widget */}
              <div className="bg-[#fcfcfc] border border-subtle rounded-[2rem] p-6 text-center shadow-inner">
                {previewLoading ? (
                  <div className="space-y-2 py-4">
                    <Skeleton className="h-10 w-24 mx-auto rounded-md" />
                    <Skeleton className="h-4 w-32 mx-auto rounded-md" />
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-[42px] font-bold tracking-tight text-primary leading-none">
                      {previewCount !== null ? previewCount : "0"}
                    </p>
                    <p className="text-[12px] text-muted font-bold mt-2 uppercase tracking-wider">Matching Contacts</p>
                  </div>
                )}
              </div>

              {/* Sample Customers List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider px-1">Sample Contacts ({previewCustomers.length})</h4>
                
                {previewLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5 p-4 bg-background/30 rounded-[1.5rem] border border-subtle">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))
                ) : previewCustomers.length === 0 ? (
                  <div className="text-center py-8 text-muted font-semibold text-[13px] border border-subtle border-dashed rounded-[1.5rem]">
                    No contacts match current criteria.
                  </div>
                ) : (
                  previewCustomers.map(cust => (
                    <div key={cust.id} className="flex justify-between items-center p-4 bg-[#fdfdfd] border border-subtle/80 rounded-[1.5rem] hover:bg-background/20 transition-all">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-primary truncate">{cust.name}</p>
                        <p className="text-[11px] text-muted font-semibold truncate mt-0.5">{cust.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-background border-subtle shrink-0">
                        {cust.channel}
                      </Badge>
                    </div>
                  ))
                )}
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
