import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { api } from "@/src/lib/api"
import { showToast } from "@/src/lib/toast"
import { Play, Pause, Sparkles, RefreshCw, BarChart2, ArrowRight, ArrowLeft } from "lucide-react"

interface CampaignStatsData {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  statusBreakdown: {
    delivered: number
    failed: number
    pending: number
  }
}

interface CampaignData {
  id: string
  name: string
  channel: string
  segment: string
  status: string
  sent: number
  message?: string
}

export default function CampaignStats() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [stats, setStats] = useState<CampaignStatsData | null>(null)
  const [insight, setInsight] = useState<{ insight: string; action: string } | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch campaign info and insights once on mount
  useEffect(() => {
    api.get(`/api/campaigns/${id}`)
      .then(res => {
        setCampaign(res)
      })
      .catch(err => {
        console.error(err)
        showToast("Campaign details unavailable.", "error")
        navigate("/campaigns")
      })

    // Fetch AI Insight
    setInsightLoading(true)
    api.get(`/api/campaigns/${id}/insight`)
      .then(setInsight)
      .catch(console.error)
      .finally(() => setInsightLoading(false))
  }, [id])

  // Poll stats every 3 seconds
  useEffect(() => {
    const fetchStats = () => {
      api.get(`/api/campaigns/${id}/stats`)
        .then(setStats)
        .catch(console.error)
    }

    // Initial fetch
    fetchStats()

    const interval = setInterval(() => {
      // Only poll if campaign is currently sending
      if (campaign?.status === "Sending") {
        fetchStats()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [id, campaign?.status])

  // Support manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const campRes = await api.get(`/api/campaigns/${id}`)
      setCampaign(campRes)
      const statsRes = await api.get(`/api/campaigns/${id}/stats`)
      setStats(statsRes)
      const insightRes = await api.get(`/api/campaigns/${id}/insight`)
      setInsight(insightRes)
      showToast("Data refreshed.", "success")
    } catch(e) {
      console.error(e)
    }
    setIsRefreshing(false)
  }

  // Toggle play/pause
  const handleToggle = async () => {
    if (!campaign) return
    try {
      const updated = await api.post(`/api/campaigns/${id}/toggle`, {})
      setCampaign(prev => prev ? { ...prev, status: updated.status } : null)
      showToast(`Campaign status updated to: ${updated.status}`, "success")
    } catch (e) {
      console.error(e)
      showToast("Failed to toggle campaign status", "error")
    }
  }

  if (!campaign || !stats) {
    return (
      <div className="max-w-[1100px] mx-auto pb-32 space-y-7">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-[60px] w-full rounded-[2rem]" />
        <div className="grid grid-cols-3 gap-7">
          <Skeleton className="col-span-2 h-[450px] rounded-[2.5rem]" />
          <Skeleton className="h-[450px] rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  // Calculate percentage rates
  const getPct = (value: number, total: number) => {
    if (!total) return "0%"
    return `${Math.round((value / total) * 100)}%`
  }

  const deliveryRate = getPct(stats.delivered, stats.sent)
  const openRate = getPct(stats.opened, stats.delivered)
  const clickRate = getPct(stats.clicked, stats.opened)
  const conversionRate = getPct(stats.converted, stats.clicked)
  const totalCvr = getPct(stats.converted, stats.sent)

  return (
    <div className="max-w-[1100px] mx-auto pb-32">
      <div className="flex items-center gap-2 text-[15px] font-semibold text-muted mb-4">
        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/campaigns')}>Campaigns</span>
        <span>/</span>
        <span className="text-primary">Analytics</span>
      </div>

      <PageHeader 
        title={campaign.name} 
        subtitle={`Live monitoring for campaign sent via ${campaign.channel} to ${campaign.segment}.`}
        action={
          <div className="flex gap-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-12 h-12 hover:bg-surface border border-subtle bg-white rounded-full flex items-center justify-center text-primary shadow-sm transition-all"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin text-accent" : ""} />
            </button>
            <Button 
              variant={campaign.status === "Sending" ? "salmon" : "dark"} 
              className="px-6 gap-2" 
              onClick={handleToggle}
            >
              {campaign.status === "Sending" ? (
                <><Pause size={16} /> Pause Campaign</>
              ) : (
                <><Play size={16} /> Resume Campaign</>
              )}
            </Button>
          </div>
        }
      />

      {/* Top Banner Status */}
      <div className="flex justify-between items-center bg-surface border border-subtle px-8 py-5 rounded-[1.8rem] shadow-sm mb-8 mt-2">
        <div className="flex gap-8">
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${campaign.status === "Sent" ? "bg-[#1e8e3e]" : campaign.status === "Sending" ? "bg-accent animate-pulse" : "bg-[#f29900]"}`} />
              <span className="font-bold text-[15px] text-primary">{campaign.status}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-subtle align-middle self-center"></div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Target Segment</span>
            <span className="font-bold text-[15px] text-primary mt-0.5 block">{campaign.segment}</span>
          </div>
          <div className="w-px h-8 bg-subtle align-middle self-center"></div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Channel Type</span>
            <span className="font-bold text-[15px] text-primary mt-0.5 block">{campaign.channel}</span>
          </div>
        </div>

        <Badge variant={campaign.status === "Sent" ? "success" : "warning"}>{campaign.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Funnel & Metric Display (col-span-2) */}
        <div className="lg:col-span-2 space-y-7">
          
          {/* Funnel Card */}
          <Card className="border border-subtle">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Conversion Funnel</CardTitle>
              <BarChart2 size={16} className="text-muted" />
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              
              {/* Funnel Layout */}
              <div className="space-y-4">
                
                {/* Sent Stage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px] font-bold text-primary px-1">
                    <span>Sent</span>
                    <span>{stats.sent.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#f6f8fb] rounded-full h-8 overflow-hidden relative border border-subtle">
                    <div className="bg-[#1a1c20] h-full rounded-full transition-all duration-700" style={{ width: '100%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">100% baseline</span>
                  </div>
                </div>

                {/* Delivered Stage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px] font-bold text-primary px-1">
                    <span>Delivered</span>
                    <span className="flex gap-2 items-center">
                      <span className="text-muted text-[11px] font-semibold">{deliveryRate} of sent</span>
                      <span>{stats.delivered.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#f6f8fb] rounded-full h-8 overflow-hidden relative border border-subtle">
                    <div className="bg-[#5b5e67] h-full rounded-full transition-all duration-700" style={{ width: deliveryRate }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">{deliveryRate} Delivery Rate</span>
                  </div>
                </div>

                {/* Opened Stage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px] font-bold text-primary px-1">
                    <span>Opened</span>
                    <span className="flex gap-2 items-center">
                      <span className="text-muted text-[11px] font-semibold">{openRate} of delivered</span>
                      <span>{stats.opened.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#f6f8fb] rounded-full h-8 overflow-hidden relative border border-subtle">
                    <div className="bg-accent/80 h-full rounded-full transition-all duration-700" style={{ width: getPct(stats.opened, stats.sent) }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">{openRate} Open Rate</span>
                  </div>
                </div>

                {/* Clicked Stage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px] font-bold text-primary px-1">
                    <span>Clicked</span>
                    <span className="flex gap-2 items-center">
                      <span className="text-muted text-[11px] font-semibold">{clickRate} of opened</span>
                      <span>{stats.clicked.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#f6f8fb] rounded-full h-8 overflow-hidden relative border border-subtle">
                    <div className="bg-accent h-full rounded-full transition-all duration-700" style={{ width: getPct(stats.clicked, stats.sent) }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">{clickRate} Click-Through Rate</span>
                  </div>
                </div>

                {/* Converted Stage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px] font-bold text-primary px-1">
                    <span>Converted</span>
                    <span className="flex gap-2 items-center">
                      <span className="text-accent text-[11px] font-bold">{conversionRate} of clicked</span>
                      <span>{stats.converted.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#f6f8fb] rounded-full h-8 overflow-hidden relative border border-subtle">
                    <div className="bg-[#1e8e3e] h-full rounded-full transition-all duration-700" style={{ width: getPct(stats.converted, stats.sent) }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">{totalCvr} Total Conversion Rate</span>
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-7">
            <Card className="border border-subtle p-6 flex flex-col justify-between">
              <div>
                <p className="text-muted text-[12px] font-bold uppercase tracking-wider mb-1">Click-Through Rate</p>
                <h4 className="text-[28px] font-extrabold text-primary">{clickRate}</h4>
              </div>
              <p className="text-[11px] text-muted font-semibold mt-3">Clicks generated per opened message</p>
            </Card>

            <Card className="border border-subtle p-6 flex flex-col justify-between">
              <div>
                <p className="text-muted text-[12px] font-bold uppercase tracking-wider mb-1">Conversion Ratio</p>
                <h4 className="text-[28px] font-extrabold text-accent">{totalCvr}</h4>
              </div>
              <p className="text-[11px] text-muted font-semibold mt-3">Conversions generated from total campaign reach</p>
            </Card>
          </div>

        </div>

        {/* Right sidebars: AI Insight & Delivery Breakdown */}
        <div className="space-y-7">
          
          {/* AI Insight Card */}
          <Card className="border border-subtle bg-gradient-to-br from-white to-[#fdf8f7] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#fae9e6]/50 rounded-full blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent fill-current" />
                AI CRM Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 z-10 relative space-y-6">
              {insightLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ) : insight ? (
                <>
                  <p className="text-[14px] font-semibold text-primary leading-relaxed">
                    "{insight.insight}"
                  </p>
                  
                  <div className="bg-white border border-subtle p-5 rounded-[1.5rem] shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-1">Suggested Follow-up</span>
                      <span className="text-[13px] font-bold text-primary leading-normal">{insight.action}</span>
                    </div>
                    
                    <Link to={`/ai?prompt=${encodeURIComponent(`Write a campaign follow-up message: "${insight.action}"`)}`}>
                      <Button variant="salmon" className="w-full justify-between rounded-full h-11 px-5 font-bold text-[13px] mt-1 shadow-sm">
                        Apply Suggested Action <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-[14px] text-muted font-bold">Insight generation failed. Refresh to try again.</p>
              )}
            </CardContent>
          </Card>

          {/* Delivery Breakdown Card */}
          <Card className="border border-subtle">
            <CardHeader className="pb-2">
              <CardTitle>Delivery Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[13px] font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e8e3e]" />
                    Delivered
                  </span>
                  <span>{stats.statusBreakdown.delivered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    Failed
                  </span>
                  <span>{stats.statusBreakdown.failed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f29900]" />
                    Pending
                  </span>
                  <span>{stats.statusBreakdown.pending.toLocaleString()}</span>
                </div>
              </div>

              {/* Graphical representation bar */}
              <div className="w-full bg-[#f6f8fb] rounded-full h-3 overflow-hidden flex border border-subtle/80 mt-2">
                <div className="bg-[#1e8e3e] h-full" style={{ width: getPct(stats.statusBreakdown.delivered, stats.sent) }} />
                <div className="bg-accent h-full" style={{ width: getPct(stats.statusBreakdown.failed, stats.sent) }} />
                <div className="bg-[#f29900] h-full" style={{ width: getPct(stats.statusBreakdown.pending, stats.sent) }} />
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
