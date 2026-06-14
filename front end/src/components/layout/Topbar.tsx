import { Search, Plus } from "lucide-react"
import { showToast } from "@/src/lib/toast"

export function Topbar() {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3 md:gap-5">
          {/* Menu Icon */}
          <div className="hidden md:flex w-11 h-11 bg-surface rounded-full flex-col items-center justify-center shadow-sm cursor-pointer border border-subtle hover:bg-background transition-colors">
            <div className="w-4 h-[2px] bg-gray-600 mb-1.5 rounded-full mr-1"></div>
            <div className="w-4 h-[2px] bg-gray-600 rounded-full ml-1"></div>
          </div>
          {/* Logo */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#121212] text-white rounded-full flex items-center justify-center shadow-md shrink-0">
            <span className="font-bold text-lg md:text-xl tracking-tighter">X<span className="text-xs md:text-sm underline underline-offset-2 align-top ml-[1px]">E</span></span>
          </div>
          {/* Title */}
          <div className="leading-tight ml-1">
            <h1 className="font-bold text-[17px] md:text-[19px]">XENO</h1>
            <p className="text-muted text-[13px] md:text-[15px]">CRM Workspace</p>
          </div>
        </div>

        {/* Avatars Group next to title */}
        <div className="hidden sm:flex items-center -space-x-2.5 ml-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#10b981] overflow-hidden bg-background relative z-0">
            <img src="https://i.pravatar.cc/100?img=32" alt="User 1" className="w-full h-full object-cover" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-[#ec5c48] overflow-hidden bg-background relative z-10">
            <img src="https://i.pravatar.cc/100?img=12" alt="User 2" className="w-full h-full object-cover" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-[#10b981] overflow-hidden bg-background relative z-20">
            <img src="https://i.pravatar.cc/100?img=47" alt="User 3" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => showToast("Invite Client feature coming soon!", "info")}
            className="w-9 h-9 rounded-full border border-subtle bg-surface hover:bg-background flex items-center justify-center text-muted hover:text-primary transition-all shadow-sm ml-2 relative z-30 text-[16px] font-bold" 
            title="Invite Client"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-5 w-full md:w-auto">
         {/* User Profile Pill */}
         <div className="flex items-center gap-3 bg-surface pl-1.5 pr-6 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-shadow">
           <button className="w-9 h-9 rounded-full border border-subtle flex items-center justify-center text-muted hover:bg-background bg-[#fdfdfd] shrink-0">
              <Plus size={16} />
           </button>
           <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-9 h-9 rounded-full object-cover border border-subtle shrink-0" />
           <div className="leading-tight ml-1">
             <p className="font-bold text-[13px]">Dwayne Tatum</p>
             <p className="text-[11px] text-muted font-medium">Marketing Admin</p>
           </div>
        </div>

        {/* Search Pill */}
        <div className="flex items-center bg-surface rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] py-1.5 pl-1.5 pr-4 w-full sm:w-72 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow border border-transparent focus-within:border-subtle group">
          <div className="w-9 h-9 bg-surface border border-subtle rounded-full flex items-center justify-center shadow-sm group-focus-within:border-subtle transition-colors shrink-0">
            <Search size={16} className="text-muted group-focus-within:text-accent" />
          </div>
          <input 
            type="text" 
            placeholder="Start searching here ..." 
            className="pl-3 bg-transparent border-none outline-none text-[13px] text-primary w-full font-medium placeholder:text-muted"
          />
        </div>
      </div>
    </header>
  )
}
