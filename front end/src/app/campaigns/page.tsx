import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { api } from "@/src/lib/api"
import { Campaign } from "@/src/types"
import { mockCampaigns } from "@/src/lib/mockData"
import { Link } from "react-router-dom"
import { Play, Pause, BarChart2, Plus } from "lucide-react"
import { showToast } from "@/src/lib/toast"

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(mockCampaigns as Campaign[])

  useEffect(() => {
    api.get("/api/campaigns").then(setCampaigns).catch(() => {})
  }, [])

  return (
    <>
      <PageHeader 
        title="Campaigns" 
        subtitle="Manage and track active messaging campaigns."
        action={<Link to="/campaigns/new"><Button variant="dark" className="gap-2 px-6"><Plus className="w-5 h-5"/>New Campaign</Button></Link>}
      />

      <Card className="p-0 overflow-hidden border-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] text-[14px] text-left">
            <thead className="text-[12px] text-muted border-b border-subtle bg-background/50">
              <tr>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Campaign Name</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Channel</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Segment</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-surface">
              {campaigns === null ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-5 w-[200px]" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-5 w-[80px]" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-5 w-[120px]" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-7 w-[60px] rounded-full" /></td>
                    <td className="px-8 py-6 text-right flex justify-end gap-2">
                       <Skeleton className="h-10 w-10 rounded-full" />
                       <Skeleton className="h-10 w-10 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-muted font-semibold text-[15px]">
                    No campaigns yet. Create your first.
                  </td>
                </tr>
              ) : (
                campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-background/50 transition-colors text-muted group">
                    <td className="px-8 py-6 font-bold text-primary text-[15px]">{c.name}</td>
                    <td className="px-8 py-6 font-semibold text-muted">{c.channel}</td>
                    <td className="px-8 py-6 font-semibold text-muted">{c.segment}</td>
                    <td className="px-8 py-6">
                      <Badge variant={c.status === "Sent" ? "success" : "warning"}>{c.status}</Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 text-muted">
                        <Link to={`/campaigns/${c.id}`}>
                          <Button variant="outline" size="icon" className="hover:text-primary h-10 w-10 border-subtle">
                            <BarChart2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="hover:text-accent h-10 w-10 border-subtle hover:border-accent/30 hover:bg-[#fae9e6] transition-colors"
                          onClick={async () => {
                            try {
                              const updated = await api.post(`/api/campaigns/${c.id}/toggle`, {})
                              setCampaigns(prev => prev ? prev.map(item => item.id === c.id ? { ...item, status: updated.status } : item) : null)
                              showToast(`Campaign status updated to: ${updated.status}`, "success")
                            } catch (e) {
                              console.error(e)
                              showToast("Failed to toggle campaign status", "error")
                            }
                          }}
                        >
                          {c.status === "Paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
