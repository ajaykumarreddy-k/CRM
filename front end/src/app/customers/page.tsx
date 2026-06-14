import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { api } from "@/src/lib/api"
import { Customer } from "@/src/types"
import { Search, Filter, RefreshCw } from "lucide-react"
import { showToast } from "@/src/lib/toast"

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChannel, setSelectedChannel] = useState("All")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const fetchCustomers = () => {
    setIsRefreshing(true)
    api.get("/api/customers")
      .then(res => {
        // Backend returns { customers: [...], total: N }
        const list = Array.isArray(res) ? res : (res?.customers ?? [])
        setCustomers(list)
        setIsRefreshing(false)
      })
      .catch(err => {
        console.error(err)
        setIsRefreshing(false)
        showToast("Failed to load customers database.", "error")
      })
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Filtering Logic
  const filteredCustomers = (customers || []).filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
      
    const matchesChannel = 
      selectedChannel === "All" || 
      c.channel.toLowerCase() === selectedChannel.toLowerCase()

    return matchesSearch && matchesChannel
  })

  return (
    <>
      <PageHeader 
        title="Customers" 
        subtitle="Manage your database of segmented contacts."
        action={
          <button 
            onClick={fetchCustomers}
            disabled={isRefreshing}
            className="w-12 h-12 hover:bg-surface border border-subtle rounded-full flex items-center justify-center text-primary shadow-sm transition-all"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-accent" : ""} />
          </button>
        }
      />
      
      {/* Search and Filter Panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-7 items-stretch sm:items-center w-full max-w-[600px]">
        <div className="relative flex-1 group shadow-[0_2px_15px_rgba(0,0,0,0.02)] rounded-full">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-subtle h-12 pl-12 pr-5 text-[14px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface border border-subtle h-12 px-4 rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <Filter size={14} className="text-muted" />
          <select 
            value={selectedChannel}
            onChange={e => {
              setSelectedChannel(e.target.value)
              showToast(`Filtered preferred channel: ${e.target.value}`, "info")
            }}
            className="bg-transparent border-0 outline-none text-[13px] font-bold text-primary pr-2 cursor-pointer"
          >
            <option value="All">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
            <option value="RCS">RCS</option>
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-subtle">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm text-left">
            <thead className="text-xs text-muted border-b border-subtle bg-background/50">
              <tr>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Name</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Email</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Phone</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Pref. Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle bg-surface">
              {customers === null ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-5"><Skeleton className="h-5 w-[150px]" /></td>
                    <td className="px-8 py-5"><Skeleton className="h-5 w-[200px]" /></td>
                    <td className="px-8 py-5"><Skeleton className="h-5 w-[120px]" /></td>
                    <td className="px-8 py-5"><Skeleton className="h-8 w-[80px] rounded-full" /></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-muted font-semibold text-[15px]">
                    No customers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-background/50 transition-colors text-muted group">
                    <td className="px-8 py-5 font-bold text-primary text-[15px]">{c.name}</td>
                    <td className="px-8 py-5 font-medium">{c.email}</td>
                    <td className="px-8 py-5 text-muted font-semibold">{c.phone}</td>
                    <td className="px-8 py-5">
                      <ChannelBadge channel={c.channel} />
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

function ChannelBadge({ channel }: { channel: string }) {
  switch (channel) {
    case "WhatsApp": return <Badge variant="success">WhatsApp</Badge>;
    case "Email": return <Badge variant="outline">Email</Badge>;
    case "SMS": return <Badge variant="dark">SMS</Badge>;
    case "RCS": return <Badge variant="warning">RCS</Badge>;
    default: return <Badge variant="default">{channel}</Badge>
  }
}
