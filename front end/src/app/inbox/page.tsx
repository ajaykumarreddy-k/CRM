import { useEffect, useState, useRef } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { api } from "@/src/lib/api"
import { showToast } from "@/src/lib/toast"
import { 
  Paperclip, 
  Send, 
  Sparkles, 
  Search, 
  VolumeX, 
  Star, 
  MoreHorizontal, 
  User,
  MessageSquare,
  Volume2
} from "lucide-react"
import { mockInboxContacts } from "@/src/lib/mockData"

interface Message {
  id: string
  sender: "contact" | "user"
  text: string
  timestamp: string
}

interface Contact {
  id: string
  name: string
  avatar: string
  email: string
  status: "online" | "offline"
  lastActive: string
  unreadCount: number
  channel: string
  messages: Message[]
}

export default function InboxPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockInboxContacts as Contact[])
  const [selectedContactId, setSelectedContactId] = useState<string>("1")
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState("All")
  
  // Message input state
  const [messageText, setMessageText] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  
  // Mute & star interactive states
  const [mutedContacts, setMutedContacts] = useState<Record<string, boolean>>({})
  const [starredContacts, setStarredContacts] = useState<Record<string, boolean>>({})

  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchContacts = (selectFirstIfEmpty = false) => {
    api.get("/api/inbox")
      .then((res: Contact[]) => {
        setContacts(res || [])
        if (selectFirstIfEmpty && res && res.length > 0) {
          setSelectedContactId(res[0].id)
        }
      })
      .catch((err) => {
        // keep mock data
      })
  }

  useEffect(() => {
    fetchContacts(true)
  }, [])

  // Auto-scroll chat history on contact switch or new messages
  const selectedContact = contacts.find(c => c.id === selectedContactId)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    
    // Mark messages as read when active
    if (selectedContact && selectedContact.unreadCount > 0) {
      api.put(`/api/inbox/${selectedContact.id}/read`, {})
        .then(() => {
          setContacts(prev => prev.map(c => 
            c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
          ))
        })
        .catch(console.error)
    }
  }, [selectedContactId, selectedContact?.messages?.length])

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!messageText.trim() || !selectedContactId) return

    const userMessageText = messageText.trim()
    setMessageText("") // Clear input optimistically

    // Post message
    api.post(`/api/inbox/${selectedContactId}/messages`, { text: userMessageText, sender: "user" })
      .then((msg: Message) => {
        // Update local state
        setContacts(prev => prev.map(c => {
          if (c.id === selectedContactId) {
            return {
              ...c,
              messages: [...c.messages, msg],
              lastActive: "Just now"
            }
          }
          return c
        }))
        showToast("Message sent!", "success")
        
        // Simulate a friendly automated auto-reply from contact after 3 seconds for realism!
        setTimeout(() => {
          simulateContactReply(selectedContactId)
        }, 3000)
      })
      .catch(() => {
        showToast("Failed to deliver message", "error")
        setMessageText(userMessageText) // Restore text on failure
      })
  }

  const simulateContactReply = (contactId: string) => {
    const contactName = contacts.find(c => c.id === contactId)?.name || "Client"
    const mockReplies = [
      `Thanks for the update! I will review and let you know.`,
      `Sounds good. Are we still on track for the due date?`,
      `Got it. I appreciate your quick response!`,
      `Perfect! Let me run this by our team and get back to you.`
    ]
    const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)]
    
    api.post(`/api/inbox/${contactId}/messages`, { text: randomReply, sender: "contact" })
      .then((msg: Message) => {
        setContacts(prev => prev.map(c => {
          if (c.id === contactId) {
            return {
              ...c,
              messages: [...c.messages, msg],
              lastActive: "Just now",
              unreadCount: selectedContactId === contactId ? 0 : c.unreadCount + 1
            }
          }
          return c
        }))
        if (selectedContactId !== contactId) {
          showToast(`New message from ${contactName}!`, "info")
        }
      })
      .catch(console.error)
  }

  const handleSmartDraft = () => {
    if (!selectedContact) return
    setAiLoading(true)
    showToast("Generating smart reply draft...", "info")
    
    api.post("/api/ai/inbox-draft", {
      conversationHistory: selectedContact.messages.slice(-5),
      contactName: selectedContact.name
    })
      .then((res: { draft: string }) => {
        setMessageText(res.draft || "")
        showToast("AI response drafted!", "success")
        setAiLoading(false)
      })
      .catch(() => {
        showToast("Assistant failed to draft reply.", "error")
        setAiLoading(false)
      })
  }

  const toggleMute = (id: string) => {
    const nextVal = !mutedContacts[id]
    setMutedContacts(prev => ({ ...prev, [id]: nextVal }))
    showToast(nextVal ? "Conversation muted" : "Conversation unmuted", "info")
  }

  const toggleStar = (id: string) => {
    const nextVal = !starredContacts[id]
    setStarredContacts(prev => ({ ...prev, [id]: nextVal }))
    showToast(nextVal ? "Starred contact" : "Unstarred contact", "success")
  }

  // Filter contacts by tab search & channel
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (channelFilter === "All") return matchesSearch
    return c.channel.toLowerCase() === channelFilter.toLowerCase() && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6 w-full h-auto md:h-[calc(100vh-140px)] pb-8 md:pb-0">
      <PageHeader 
        title="Inbox Channels" 
        subtitle="Manage unified client communication and drafts."
      />

      <div className="flex flex-col md:flex-row gap-5 md:gap-7 flex-1 min-h-0 items-stretch">
        {/* Chat Feed Panel */}
        <Card className="flex-1 border border-subtle bg-surface flex flex-col min-w-0 md:min-w-[500px] overflow-hidden p-0 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] h-[500px] md:h-auto">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-subtle bg-surface z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={selectedContact.avatar} 
                      alt={selectedContact.name} 
                      className="w-10 h-10 rounded-full object-cover border border-subtle"
                    />
                    {selectedContact.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-surface rounded-full"></span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <h4 className="font-bold text-[14px] text-primary">{selectedContact.name}</h4>
                    <p className="text-[11px] text-muted font-semibold mt-0.5">
                      USA | Local time: <span className="text-primary font-bold">Apr 1, 2025, 3:09 PM</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted">
                  <button 
                    onClick={() => toggleMute(selectedContact.id)}
                    className={`p-2.5 hover:bg-background rounded-full transition-all border border-transparent ${
                      mutedContacts[selectedContact.id] ? 'text-accent border-subtle bg-[#fae9e6]/20' : 'hover:text-primary hover:border-subtle'
                    }`}
                    title="Mute"
                  >
                    {mutedContacts[selectedContact.id] ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button 
                    onClick={() => toggleStar(selectedContact.id)}
                    className={`p-2.5 hover:bg-background rounded-full transition-all border border-transparent ${
                      starredContacts[selectedContact.id] ? 'text-accent border-subtle bg-[#fae9e6]/20' : 'hover:text-primary hover:border-subtle'
                    }`}
                    title="Star Client"
                  >
                    <Star size={16} className={starredContacts[selectedContact.id] ? "fill-current" : ""} />
                  </button>
                  <button className="p-2.5 hover:bg-background rounded-full hover:text-primary transition-all border border-transparent hover:border-subtle">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-surface space-y-6">
                {selectedContact.messages.map((msg) => {
                  const isUser = msg.sender === "user"
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3.5 rounded-[1.6rem] text-[13px] font-semibold leading-relaxed shadow-sm
                          ${isUser 
                            ? 'bg-[#121212] text-white rounded-tr-sm' 
                            : 'bg-[#f6f8fb] border border-subtle text-primary rounded-tl-sm'
                          }
                        `}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-muted font-bold mt-1.5 px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Footer Input Area */}
              <div className="p-6 bg-surface border-t border-subtle shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-4 items-center max-w-[850px] mx-auto w-full">
                  <button 
                    type="button"
                    onClick={() => showToast("Attachment system loading...", "info")}
                    className="w-11 h-11 border border-subtle bg-surface hover:bg-background rounded-full flex items-center justify-center text-muted hover:text-primary transition-all shrink-0 shadow-sm"
                    title="Attach Files"
                  >
                    <Paperclip size={16} />
                  </button>
                  
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Send message..."
                      className="w-full bg-[#fdfdfd] border border-subtle h-12 pl-6 pr-28 text-[13px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary"
                    />
                    
                    {/* Action buttons inside input */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSmartDraft}
                        disabled={aiLoading}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-[#fae9e6] hover:bg-[#f6d7d2] text-accent disabled:opacity-50"
                        title="Generate Smart AI Reply"
                      >
                        <Sparkles size={14} className={aiLoading ? "animate-pulse" : ""} />
                      </button>
                      <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="w-8 h-8 bg-[#121212] hover:bg-black text-white disabled:bg-subtle disabled:text-muted rounded-full flex items-center justify-center transition-all"
                      >
                        <Send size={13} className="ml-[1px]" />
                      </button>
                    </div>
                  </div>
                </form>
                <p className="text-[10px] text-muted text-center mt-3 font-semibold">
                  LoopAI can make mistakes. Consider checking important information.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageSquare size={48} className="text-subtle mb-4 animate-bounce" />
              <p className="font-bold text-[14px]">No active conversation selected.</p>
            </div>
          )}
        </Card>

        {/* Right Contacts Feed Panel */}
        <Card className="w-full md:w-[340px] border border-subtle bg-surface flex flex-col overflow-hidden p-0 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] shrink-0 order-first md:order-last h-[400px] md:h-auto">
          {/* Header */}
          <div className="p-6 border-b border-subtle shrink-0">
            <h3 className="font-bold text-[15px] text-primary mb-4">All Messages</h3>
            
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={13} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-background border border-subtle h-9 pl-9 pr-3 text-[11px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary"
                />
              </div>

              {/* Channel Dropdown Filter */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-background border border-subtle h-9 px-3 rounded-full text-[11px] font-bold text-primary cursor-pointer outline-none w-28 text-center shrink-0"
              >
                <option value="All">All Channels</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="RCS">RCS</option>
              </select>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-subtle/50">
            {loading ? (
              <p className="text-center text-muted font-bold text-[12px] py-10">Loading contacts...</p>
            ) : filteredContacts.length === 0 ? (
              <p className="text-center text-muted font-bold text-[12px] py-10">No chats found.</p>
            ) : (
              filteredContacts.map((c) => {
                const isActive = c.id === selectedContactId
                const lastMessage = c.messages[c.messages.length - 1]
                const isMuted = mutedContacts[c.id]
                const isStarred = starredContacts[c.id]

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContactId(c.id)}
                    className={`w-full p-4 flex gap-3 text-left transition-colors relative hover:bg-background/20
                      ${isActive ? 'bg-background/60 border-l-4 border-accent pl-3' : ''}
                    `}
                  >
                    {/* Avatar with status circle */}
                    <div className="relative shrink-0">
                      <img 
                        src={c.avatar} 
                        alt={c.name} 
                        className="w-10 h-10 rounded-full object-cover border border-subtle"
                      />
                      {c.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-surface rounded-full"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Name & Time */}
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[13px] text-primary truncate flex items-center gap-1.5">
                          {c.name}
                          {isStarred && <Star size={10} className="text-accent fill-current" />}
                          {isMuted && <VolumeX size={10} className="text-muted" />}
                        </h4>
                        <span className="text-[10px] text-muted font-semibold whitespace-nowrap">{c.lastActive}</span>
                      </div>

                      {/* Msg preview & Badge */}
                      <div className="flex justify-between items-center mt-1 gap-2">
                        <p className="text-[11px] text-muted font-semibold truncate flex-1">
                          {lastMessage ? lastMessage.text : "No messages."}
                        </p>
                        {c.unreadCount > 0 && (
                          <Badge className="bg-accent text-white font-bold rounded-full text-[9px] min-w-[18px] h-[18px] px-1 hover:bg-accent border-none flex items-center justify-center shrink-0">
                            {c.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
