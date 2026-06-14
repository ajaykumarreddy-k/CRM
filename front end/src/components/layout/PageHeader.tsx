import { ReactNode, useState, useRef, useEffect } from "react"
import { Calendar, Mic, ArrowRight, ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { showToast } from "@/src/lib/toast"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  showCalendarAndMic?: boolean
}

// Mock campaign & task events for December 2026
const EVENT_DATA: Record<number, { title: string; type: "campaign" | "segment" | "task"; time: string }[]> = {
  3: [{ title: "Re-engage Promo Scheduled", type: "campaign", time: "10:00 AM" }],
  9: [{ title: "WhatsApp Fans segment created", type: "segment", time: "02:15 PM" }],
  15: [{ title: "Spring Sale campaign launched", type: "campaign", time: "09:00 AM" }],
  19: [
    { title: "Active Campaigns stats updated", type: "task", time: "08:30 AM" },
    { title: "Review morning analytics feed", type: "task", time: "11:00 AM" }
  ],
  22: [{ title: "Scheduled winter email newsletter", type: "campaign", time: "10:30 AM" }],
  28: [{ title: "Review yearly performance reports", type: "task", time: "04:00 PM" }]
}

export function PageHeader({ title, subtitle, action, showCalendarAndMic = false }: PageHeaderProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(19) // Default: Today (Dec 19, 2026)
  const calendarRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Click outside to close handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // December 2026 starts on a Tuesday (Offset of 2 empty days in calendar grid)
  const daysInMonth = 31
  const gridOffset = 2 

  // Generate calendar days
  const calendarCells = []
  
  // November padded days
  for (let i = 29; i <= 30; i++) {
    calendarCells.push({ day: i, currentMonth: false })
  }
  // December days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ day: i, currentMonth: true })
  }
  // January padded days
  const remainingCells = 35 - calendarCells.length // grid of 5 weeks (35 days)
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({ day: i, currentMonth: false })
  }

  const selectedEvents = EVENT_DATA[selectedDay] || []

  const handleDayClick = (day: number, currentMonth: boolean) => {
    if (!currentMonth) return // Only allow selecting active month
    setSelectedDay(day)
    if (EVENT_DATA[day]) {
      showToast(`Selected Dec ${day}: ${EVENT_DATA[day].length} event(s)`, "info")
    } else {
      showToast(`Selected Dec ${day}: No scheduled events`, "info")
    }
  }

  return (
    <section className="flex items-center justify-between mb-8 mt-2 relative">
      <div className="flex items-center gap-6">
        {showCalendarAndMic && (
          <>
            <div className="w-20 h-20 bg-surface border border-subtle rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
              <span className="text-[32px] font-medium tracking-tight">19</span>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-[17px]">Tue,</p>
              <p className="text-muted text-[15px]">December</p>
            </div>
            <div className="h-10 w-px bg-subtle mx-2"></div>
          </>
        )}

        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
        
        {showCalendarAndMic && (
           <div className="flex items-center gap-2 relative">
            <button className="bg-accent hover:bg-[#d85240] text-white px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-colors shadow-sm text-[15px]">
              Show my Tasks
              <ArrowRight size={18} className="ml-1" />
            </button>
            
            {/* Interactive Calendar Toggle Button */}
            <button 
              ref={buttonRef}
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm relative transition-all border ${showCalendar ? 'bg-[#fae9e6] border-accent/40 text-accent ring-4 ring-accent/5' : 'bg-surface border-subtle text-primary hover:bg-background'}`}
              title="Open Marketing Calendar"
            >
              <Calendar size={18} />
              <div className="w-2.5 h-2.5 bg-accent border-2 border-surface rounded-full absolute top-2 right-2"></div>
            </button>

            {/* Calendar Popover */}
            {showCalendar && (
              <div 
                ref={calendarRef}
                className="absolute top-14 left-0 mt-2 bg-surface border border-subtle shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-[2.2rem] p-6 w-[340px] z-50 animate-fade-in text-left flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-1">
                  <h4 className="font-bold text-primary text-[15px] flex items-center gap-1.5">
                    December 2026
                  </h4>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-background rounded-full text-muted hover:text-primary transition-colors" onClick={() => showToast("Calendar navigation is locked to current month", "info")}>
                      <ChevronLeft size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-background rounded-full text-muted hover:text-primary transition-colors" onClick={() => showToast("Calendar navigation is locked to current month", "info")}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted uppercase tracking-wider">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarCells.map((cell, idx) => {
                    const isSelected = cell.currentMonth && cell.day === selectedDay
                    const isToday = cell.currentMonth && cell.day === 19
                    const hasEvent = cell.currentMonth && !!EVENT_DATA[cell.day]

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDayClick(cell.day, cell.currentMonth)}
                        disabled={!cell.currentMonth}
                        className={`h-9 w-9 rounded-full flex flex-col items-center justify-center text-[12px] font-bold transition-all relative
                          ${!cell.currentMonth ? 'text-subtle/30 cursor-not-allowed' : ''}
                          ${cell.currentMonth && !isSelected ? 'text-primary hover:bg-background' : ''}
                          ${isSelected ? 'bg-[#121212] text-white shadow-md' : ''}
                          ${isToday && !isSelected ? 'border border-accent text-accent' : ''}
                        `}
                      >
                        <span>{cell.day}</span>
                        {/* Event Dot */}
                        {hasEvent && (
                          <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-accent' : 'bg-accent'}`} />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Event Details Panel */}
                <div className="border-t border-subtle pt-4 mt-1 flex flex-col gap-3 min-h-[90px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Events: Dec {selectedDay}</span>
                    <Link to="/campaigns/new" onClick={() => setShowCalendar(false)} className="text-[11px] font-bold text-accent hover:underline flex items-center gap-0.5">
                      <Plus size={10} strokeWidth={3} /> New Campaign
                    </Link>
                  </div>

                  {selectedEvents.length === 0 ? (
                    <p className="text-[12px] text-muted font-medium py-2 px-1">No campaigns or tasks scheduled.</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto pr-1">
                      {selectedEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-start justify-between bg-background/50 border border-subtle rounded-xl p-2.5">
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-primary truncate leading-tight">{evt.title}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full 
                                ${evt.type === 'campaign' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : ''}
                                ${evt.type === 'segment' ? 'bg-[#fef7e0] text-[#f29900]' : ''}
                                ${evt.type === 'task' ? 'bg-[#fce8e6] text-accent' : ''}
                              `}>
                                {evt.type}
                              </span>
                              <span className="text-[10px] text-muted font-semibold">{evt.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-right">
        {subtitle ? (
           <h2 className="text-[38px] tracking-tight flex items-center">
             <span className="font-bold">{title}</span>
             {title.includes("Hey") && <span className="ml-2 text-4xl">👋</span>}
             <span className="text-gray-300 font-light mx-3">|</span>
             <span className="text-muted font-light">{subtitle}</span>
           </h2>
        ) : (
           <h2 className="text-[38px] tracking-tight font-bold">{title}</h2>
        )}
        
        {showCalendarAndMic && (
          <button 
            className="w-[60px] h-[60px] bg-surface rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.02)] ml-4 hover:bg-background transition-colors border border-subtle"
            onClick={() => showToast("AI voice assistant activated!", "success")}
          >
            <Mic size={22} className="text-primary" />
          </button>
        )}
      </div>
    </section>
  )
}
