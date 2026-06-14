import { useEffect, useState } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import { api } from "@/src/lib/api"
import { Segment } from "@/src/types"
import { formatDate } from "@/src/lib/utils"
import { PieChart, Plus, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function Segments() {
  const [segments, setSegments] = useState<Segment[] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/api/segments").then(setSegments).catch(console.error)
  }, [])

  return (
    <>
      <PageHeader 
        title="Segments" 
        subtitle="Manage dynamic audiences built with AI rules." 
        action={
          <Link to="/segments/new">
            <Button variant="salmon" className="gap-2 px-6">
              <Plus className="w-5 h-5"/> Create Segment
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        {segments === null ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </CardHeader>
              <CardContent className="flex flex-col justify-end pt-4 border-t border-subtle">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-[60px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <Skeleton className="h-6 w-[70px] rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : segments.length === 0 ? (
          <div className="col-span-full py-24 text-center text-muted bg-surface shadow-sm rounded-[2.5rem] border border-subtle border-dashed font-semibold text-[15px] flex flex-col items-center gap-4">
            <PieChart className="w-12 h-12 text-gray-200" />
            No segments yet. Create one or ask AI.
          </div>
        ) : (
          segments.map(s => (
            <Card 
              key={s.id} 
              onClick={() => navigate(`/segments/${s.id}`)}
              className="cursor-pointer group flex flex-col justify-between hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="group-hover:text-accent transition-colors">{s.name}</CardTitle>
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center group-hover:bg-[#fce8e6] transition-colors">
                   <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-end pt-4 border-t border-subtle">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[32px] font-bold tracking-tight text-primary leading-none">{s.count}</p>
                    <p className="text-[12px] text-muted font-semibold">Audience size</p>
                  </div>
                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider bg-background px-3 py-1.5 rounded-full">
                    {formatDate(s.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
