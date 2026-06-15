import { useEffect, useState, useRef } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { api } from "@/src/lib/api"
import { showToast } from "@/src/lib/toast"
import { mockProjects } from "@/src/lib/mockData"
import { Plus, Search, HelpCircle, FileText, Calendar, DollarSign, MoreVertical, Trash2, Edit3, X, Check, CheckCircle2 } from "lucide-react"

interface Project {
  id: string
  clientName: string
  clientAvatar: string
  clientEmail: string
  projectName: string
  projectDesc: string
  dueDate: string
  contractValue: number
  status: "Draft" | "In Progress" | "On Review" | "Completed" | "Canceled" | "Recommended"
  hasNote: boolean
  notes: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects as Project[])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("All")
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  
  // Form states
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [contractValue, setContractValue] = useState("")
  const [status, setStatus] = useState<Project["status"]>("Draft")
  const [notes, setNotes] = useState("")
  
  // Action dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchProjects = () => {
    api.get("/api/projects")
      .then((res) => {
        setProjects(res || [])
      })
      .catch((err) => {
        // keep mock data
      })
  }

  useEffect(() => {
    fetchProjects()

    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      clientName,
      clientEmail: clientEmail.startsWith("@") ? clientEmail.slice(1) : clientEmail,
      projectName,
      projectDesc,
      dueDate,
      contractValue: Number(contractValue),
      status,
      notes
    }

    if (editingProject) {
      api.put(`/api/projects/${editingProject.id}`, payload)
        .then(() => {
          showToast("Project successfully updated!", "success")
          setShowCreateModal(false)
          setEditingProject(null)
          resetForm()
          fetchProjects()
        })
        .catch(() => showToast("Failed to update project", "error"))
    } else {
      api.post("/api/projects", payload)
        .then(() => {
          showToast("New project registered successfully!", "success")
          setShowCreateModal(false)
          resetForm()
          fetchProjects()
        })
        .catch(() => showToast("Failed to create project", "error"))
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      api.delete(`/api/projects/${id}`)
        .then(() => {
          showToast("Project deleted successfully.", "success")
          fetchProjects()
        })
        .catch(() => showToast("Failed to delete project", "error"))
    }
    setActiveDropdownId(null)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setClientName(project.clientName)
    setClientEmail(project.clientEmail)
    setProjectName(project.projectName)
    setProjectDesc(project.projectDesc)
    setDueDate(project.dueDate)
    setContractValue(String(project.contractValue))
    setStatus(project.status)
    setNotes(project.notes)
    setShowCreateModal(true)
    setActiveDropdownId(null)
  }

  const resetForm = () => {
    setClientName("")
    setClientEmail("")
    setProjectName("")
    setProjectDesc("")
    setDueDate("")
    setContractValue("")
    setStatus("Draft")
    setNotes("")
  }

  // Filter projects by Tab and Search Query
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectDesc.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "All") return matchesSearch
    return p.status.toLowerCase() === activeTab.toLowerCase() && matchesSearch
  })

  // Count helper functions
  const getCountByStatus = (statusName: string) => {
    return projects.filter(p => p.status.toLowerCase() === statusName.toLowerCase()).length
  }

  // Stats
  const totalProjectsCount = projects.length
  const priorityTasksCount = getCountByStatus("Draft") + getCountByStatus("On Review")
  const activeTasksCount = getCountByStatus("In Progress")
  const completedWorkCount = getCountByStatus("Completed")

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <PageHeader 
            title="Manage Projects" 
            subtitle="Track active work objectives, dues, and client billing."
          />
        </div>
        <Button 
          variant="salmon" 
          className="rounded-full h-12 px-7 font-bold text-[15px] shadow-sm flex items-center gap-2"
          onClick={() => {
            setEditingProject(null)
            resetForm()
            setShowCreateModal(true)
          }}
        >
          <Plus size={16} /> New Project
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-[2rem] border border-subtle bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[120px]">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Total Projects</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none">{totalProjectsCount}</span>
            <Badge className="bg-[#e6f4ea] text-[#1e8e3e] font-bold rounded-full text-[11px] px-3.5 py-1 hover:bg-[#e6f4ea] border-none shadow-none">
              +{totalProjectsCount} new
            </Badge>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-subtle bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[120px]">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Priority Tasks</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none">{priorityTasksCount}</span>
            <span className="text-[12px] text-[#ec5c48] font-bold">Needs action</span>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-subtle bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[120px]">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Active Tasks</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none">{activeTasksCount}</span>
            <span className="text-[12px] text-muted font-bold">In Progress</span>
          </div>
        </Card>

        <Card className="p-6 rounded-[2rem] border border-subtle bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between h-[120px]">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Completed Work</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[34px] font-bold tracking-tight leading-none">{completedWorkCount}</span>
            <span className="text-[12px] text-[#1e8e3e] font-bold">100% payout</span>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-2 w-full">
        <div className="flex flex-wrap gap-2.5">
          {["All", "Priority", "Active", "Completed", "Canceled", "Recommended"].map((tab) => {
            const isTabActive = activeTab === tab
            let count = projects.length
            if (tab === "Priority") count = getCountByStatus("Draft") + getCountByStatus("On Review")
            else if (tab === "Active") count = getCountByStatus("In Progress")
            else if (tab === "Completed") count = getCountByStatus("Completed")
            else if (tab === "Canceled") count = getCountByStatus("Canceled")
            else if (tab === "Recommended") count = getCountByStatus("Recommended")

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 border ${
                  isTabActive 
                    ? "bg-surface text-primary shadow-sm border-subtle" 
                    : "text-muted hover:text-primary hover:bg-background border-transparent"
                }`}
              >
                {tab} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isTabActive ? "bg-background text-primary" : "bg-subtle/50 text-muted"}`}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-surface border border-subtle h-11 pl-11 pr-4 rounded-full text-[13px] font-semibold outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all text-primary"
          />
        </div>
      </div>

      {/* Table section */}
      <Card className="border border-subtle bg-surface rounded-[2.5rem] overflow-hidden p-0 shadow-[0_8px_30px_rgb(0,0,0,0.01)] mt-2">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="border-b border-subtle text-[11px] font-bold uppercase text-muted tracking-wider bg-background/30 h-14">
                <th className="pl-8 w-[240px]">Client</th>
                <th className="px-6 w-[280px]">Task Details</th>
                <th className="px-6 text-center w-[80px]">Note</th>
                <th className="px-6 w-[120px]">Due Date</th>
                <th className="px-6 w-[150px]">Contract Value</th>
                <th className="px-6 w-[140px]">Status</th>
                <th className="pr-8 text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 font-bold text-muted text-[14px]">
                    Loading project records...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 font-bold text-muted text-[14px]">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-background/20 transition-colors h-[76px] text-[13px] font-semibold text-primary">
                    {/* Client cell */}
                    <td className="pl-8">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.clientAvatar || "https://i.pravatar.cc/100?img=1"} 
                          alt={p.clientName} 
                          className="w-9 h-9 rounded-full object-cover border border-subtle"
                        />
                        <div className="leading-tight">
                          <p className="font-bold text-primary">{p.clientName}</p>
                          <p className="text-[11px] text-muted font-medium mt-0.5">@{p.clientEmail || "client"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Task Details */}
                    <td className="px-6">
                      <div className="leading-tight">
                        <p className="font-bold text-primary">{p.projectName}</p>
                        <p className="text-[11.5px] text-muted font-semibold mt-0.5">{p.projectDesc}</p>
                      </div>
                    </td>

                    {/* Note Indicator with custom popup */}
                    <td className="px-6 text-center relative group">
                      {p.notes ? (
                        <div className="inline-block relative">
                          <button 
                            className="p-2 bg-background hover:bg-subtle/20 border border-subtle rounded-full text-muted hover:text-primary transition-all shadow-inner"
                            title={p.notes}
                          >
                            <FileText size={14} className="text-accent" />
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#121212] text-white text-[11px] font-bold py-2 px-3.5 rounded-xl whitespace-nowrap shadow-md z-40">
                            {p.notes}
                            <div className="w-2.5 h-2.5 bg-[#121212] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 z-30"></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-subtle font-light">-</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 text-muted font-bold">
                      {p.dueDate}
                    </td>

                    {/* Contract Value */}
                    <td className="px-6 font-bold text-[14px]">
                      ${p.contractValue.toFixed(2)}
                    </td>

                    {/* Status badge */}
                    <td className="px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider border
                        ${p.status === 'Completed' ? 'bg-[#e6f4ea] text-[#1e8e3e] border-[#e6f4ea]' : ''}
                        ${p.status === 'In Progress' ? 'bg-[#e8f0fe] text-[#1967d2] border-[#e8f0fe]' : ''}
                        ${p.status === 'On Review' ? 'bg-[#fef7e0] text-[#b06000] border-[#fef7e0]' : ''}
                        ${p.status === 'Draft' ? 'bg-[#f1f3f4] text-[#5f6368] border-[#f1f3f4]' : ''}
                        ${p.status === 'Canceled' ? 'bg-[#fce8e6] text-[#c5221f] border-[#fce8e6]' : ''}
                        ${p.status === 'Recommended' ? 'bg-[#fae9e6] text-[#ec5c48] border-[#fae9e6]' : ''}
                      `}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="pr-8 text-right relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === p.id ? null : p.id)}
                        className="p-2 hover:bg-background rounded-full text-muted hover:text-primary transition-all inline-flex items-center border border-transparent hover:border-subtle"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Floating actions dropdown */}
                      {activeDropdownId === p.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-8 top-12 bg-surface border border-subtle shadow-lg rounded-[1.2rem] py-2 w-[120px] z-50 overflow-hidden text-left"
                        >
                          <button
                            onClick={() => openEditModal(p)}
                            className="w-full px-4 py-2 hover:bg-background text-[12px] font-bold text-primary flex items-center gap-2 transition-colors"
                          >
                            <Edit3 size={13} /> Edit Project
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="w-full px-4 py-2 hover:bg-background text-[12px] font-bold text-[#ec5c48] flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Dialog for Project Form */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
          <Card className="w-[500px] rounded-[2.5rem] border border-subtle bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 relative flex flex-col gap-6">
            <button 
              onClick={() => {
                setShowCreateModal(false)
                setEditingProject(null)
              }}
              className="absolute top-6 right-6 p-2 text-muted hover:text-primary hover:bg-background rounded-full transition-colors border border-subtle bg-surface"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-[20px] font-bold tracking-tight text-primary">
                {editingProject ? "Edit Project Details" : "Register New Project"}
              </h3>
              <p className="text-muted text-[13px] font-medium mt-1">
                {editingProject ? "Modify fields below to update task metrics." : "Add a client project to tracking feed."}
              </p>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Sophie T."
                    className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Client Email Username</label>
                  <input
                    type="text"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="@sophie.turner"
                    className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Garden Grove Designs"
                  className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Task Description</label>
                <input
                  type="text"
                  required
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Mobile Application Design"
                  className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Due Date</label>
                  <input
                    type="text"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Apr 2"
                    className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Contract Value ($)</label>
                  <input
                    type="number"
                    required
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="25.00"
                    className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-background border border-subtle h-11 px-3.5 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Review">On Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Recommended">Recommended</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Project Note / Status Note</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Initial mockups need client approval."
                    className="w-full bg-background border border-subtle h-11 px-4 rounded-xl text-[13px] font-semibold outline-none focus:border-accent/40 text-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-full h-12 font-bold"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingProject(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="salmon" 
                  className="flex-1 rounded-full h-12 font-bold"
                >
                  {editingProject ? "Save Changes" : "Register Project"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
