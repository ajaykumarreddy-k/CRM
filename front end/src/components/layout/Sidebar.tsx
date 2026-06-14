import { Link, useLocation } from "react-router-dom"
import { Users, PieChart, Send, Bot, Plus, Share2, Home, Package, Briefcase, MessageSquare, Bell } from "lucide-react"
import { showToast } from "@/src/lib/toast"

export function Sidebar() {
  const location = useLocation()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast("Copied page link to clipboard!", "success"))
      .catch(() => showToast("Failed to copy link", "error"))
  }

  return (
    <div className="flex flex-row md:flex-col gap-2 md:gap-4 bg-surface md:rounded-full py-3 md:py-5 px-4 md:px-2 shadow-[0_-8px_30px_rgb(0,0,0,0.05)] md:shadow-[0_8px_30px_rgb(0,0,0,0.03)] items-center fixed md:sticky bottom-0 md:top-6 left-0 right-0 md:w-16 z-50 overflow-x-auto overflow-y-hidden md:overflow-visible justify-between md:justify-start">
      <div className="hidden md:flex w-[42px] h-[75px] bg-[#fdfdfd] rounded-full border border-subtle items-center justify-center cursor-pointer mb-2 shadow-sm shrink-0">
         <div className="w-[3px] h-6 bg-[#d1d5db] rounded-full"></div>
      </div>

      <NavItem to="/" icon={<Home size={20} />} active={location.pathname === "/"} />
      <NavItem to="/customers" icon={<Users size={20} />} active={location.pathname.startsWith("/customers")} />
      <NavItem to="/segments" icon={<PieChart size={20} />} active={location.pathname.startsWith("/segments")} />
      <NavItem to="/projects" icon={<Briefcase size={20} />} active={location.pathname.startsWith("/projects")} />
      <NavItem to="/inbox" icon={<MessageSquare size={20} />} active={location.pathname.startsWith("/inbox")} />
      <NavItem to="/campaigns" icon={<Send size={20} />} active={location.pathname.startsWith("/campaigns")} />
      <NavItem to="/ai" icon={<Bot size={20} />} active={location.pathname.startsWith("/ai")} />
      <NavItem to="/products" icon={<Package size={20} />} active={location.pathname.startsWith("/products")} />
      
      <div className="hidden md:block w-8 h-[2px] bg-background rounded-full my-1 shrink-0"></div>
      
      <Link to="/campaigns/new" className="hidden md:flex w-10 h-10 hover:bg-background rounded-full items-center justify-center text-primary transition-colors shrink-0">
        <Plus size={20} />
      </Link>
      <button 
        onClick={handleShare}
        className="hidden md:flex w-10 h-10 hover:bg-background rounded-full items-center justify-center text-primary transition-colors shrink-0"
      >
        <Share2 size={18} />
      </button>
      <button 
        onClick={() => showToast("You have 3 unread client messages.", "info")}
        className="hidden md:flex w-10 h-10 hover:bg-background rounded-full items-center justify-center text-primary transition-colors relative shrink-0"
      >
        <Bell size={18} />
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface"></span>
      </button>
    </div>
  )
}

function NavItem({ to, icon, active }: { to: string, icon: React.ReactNode, active: boolean }) {
  return (
    <Link to={to} className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${active ? "bg-[#fdfdfd] border border-subtle shadow-sm text-primary" : "text-muted hover:text-primary hover:bg-background"}`}>
      {icon}
    </Link>
  )
}
