// ─── XENO CRM Mock Data Layer ─────────────────────────────────────────────────
// Provides rich test data for all pages when the backend is offline.

export const MOCK_ENABLED = true;

// ── Helper ────────────────────────────────────────────────────────────────────
function delay<T>(data: T, ms = 350): Promise<T> {
  return new Promise((res) => setTimeout(() => res(data), ms));
}

// ── Dashboard Summary ─────────────────────────────────────────────────────────
export const mockDashboardSummary = {
  metrics: {
    customers: 2847,
    campaigns: 14,
    sent: 128430,
    cvr: 4.7,
    clients: 2847,
    clientsComparison: "+12%",
    clientsSubtitle: "vs 2,541 last month",
    revenue: 48920,
    revenueComparison: "+18%",
    revenueSubtitle: "$41,450 last month",
    projects: 37,
    projectsComparison: "+6",
    projectsSubtitle: "31 last month",
  },
};

// ── Customers ─────────────────────────────────────────────────────────────────
export const mockCustomers = [
  { id: "1",  name: "Sophie Turner",     email: "sophie.turner@gmail.com",    phone: "+1 (555) 210-4820", channel: "WhatsApp" },
  { id: "2",  name: "James Mitchell",    email: "j.mitchell@outlook.com",     phone: "+1 (555) 383-9201", channel: "Email" },
  { id: "3",  name: "Priya Sharma",      email: "priya.s@yahoo.com",          phone: "+91 98200 44312",   channel: "SMS" },
  { id: "4",  name: "Carlos Mendez",     email: "carlosmendez@proton.me",     phone: "+52 55 3910 8843",  channel: "RCS" },
  { id: "5",  name: "Emily Watson",      email: "emwatson@company.io",        phone: "+1 (555) 740-2291", channel: "WhatsApp" },
  { id: "6",  name: "Lucas Fernandez",   email: "lucas.f@mail.com",           phone: "+34 612 993 401",   channel: "Email" },
  { id: "7",  name: "Aisha Okafor",      email: "aisha.ok@gmail.com",         phone: "+234 803 710 9991", channel: "SMS" },
  { id: "8",  name: "Nathan Brooks",     email: "nbrooks@enterprise.com",     phone: "+1 (555) 609-1123", channel: "WhatsApp" },
  { id: "9",  name: "Yuna Kim",          email: "yunakim93@naver.com",        phone: "+82 10 4423 8871",  channel: "RCS" },
  { id: "10", name: "Amelia Clarke",     email: "a.clarke@oxford.ac.uk",      phone: "+44 7700 900456",   channel: "Email" },
  { id: "11", name: "David Okonkwo",     email: "david.ok@techfirm.ng",       phone: "+234 802 100 4422", channel: "WhatsApp" },
  { id: "12", name: "Isabella Rossi",    email: "irossi@studio.it",           phone: "+39 338 712 4901",  channel: "SMS" },
  { id: "13", name: "Haruto Yamamoto",   email: "h.yamamoto@dev.jp",          phone: "+81 90 6641 2231",  channel: "Email" },
  { id: "14", name: "Fatima Al-Rashid",  email: "fatima.alr@corp.ae",         phone: "+971 50 340 9912",  channel: "WhatsApp" },
  { id: "15", name: "Tom Henderson",     email: "tom.h@startup.co",           phone: "+1 (555) 822-3310", channel: "RCS" },
  { id: "16", name: "Mei Lin",           email: "meilin@wecloud.cn",          phone: "+86 138 0013 8000", channel: "Email" },
  { id: "17", name: "Samuel Adeyemi",    email: "samadeyemi@gmail.com",       phone: "+234 703 991 8821", channel: "SMS" },
  { id: "18", name: "Chloe Dupont",      email: "chloe.dupont@laposte.fr",    phone: "+33 6 12 34 56 78", channel: "WhatsApp" },
  { id: "19", name: "Ryan Patel",        email: "ryan.patel@consulting.in",   phone: "+91 99880 12345",   channel: "Email" },
  { id: "20", name: "Olivia Chen",       email: "olivia.chen@pixel.us",       phone: "+1 (555) 331-8802", channel: "WhatsApp" },
];

// ── Segments ──────────────────────────────────────────────────────────────────
export const mockSegments = [
  { id: "1", name: "High-Value Buyers",    rules: [{ field: "ltv", op: "gt", value: 1000 }],       count: 312,  createdAt: "2025-04-01T10:00:00Z" },
  { id: "2", name: "WhatsApp Fans",        rules: [{ field: "channel", op: "eq", value: "WhatsApp" }], count: 984, createdAt: "2025-03-15T08:30:00Z" },
  { id: "3", name: "Win-Back Targets",     rules: [{ field: "days_inactive", op: "gt", value: 90 }],  count: 421,  createdAt: "2025-03-28T14:45:00Z" },
  { id: "4", name: "New Subscribers",      rules: [{ field: "days_since_join", op: "lt", value: 30 }], count: 167, createdAt: "2025-04-05T09:15:00Z" },
  { id: "5", name: "Email Engaged",        rules: [{ field: "channel", op: "eq", value: "Email" }],    count: 728,  createdAt: "2025-03-10T11:00:00Z" },
  { id: "6", name: "Loyalty Tier Gold",    rules: [{ field: "loyalty", op: "eq", value: "gold" }],    count: 89,   createdAt: "2025-04-08T16:20:00Z" },
  { id: "7", name: "Cart Abandoners",      rules: [{ field: "cart_abandoned", op: "eq", value: true }], count: 253, createdAt: "2025-04-02T13:00:00Z" },
  { id: "8", name: "SMS Opted-In",         rules: [{ field: "channel", op: "eq", value: "SMS" }],     count: 502,  createdAt: "2025-03-20T07:00:00Z" },
];

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const mockCampaigns = [
  { id: "1", name: "Spring Sale Blast",       channel: "WhatsApp", segment: "High-Value Buyers",  status: "Sent",    sent: 312 },
  { id: "2", name: "Win-Back Re-engagement",  channel: "Email",    segment: "Win-Back Targets",   status: "Paused",  sent: 0   },
  { id: "3", name: "New Member Welcome",      channel: "SMS",      segment: "New Subscribers",    status: "Sent",    sent: 167 },
  { id: "4", name: "Flash Offer – 24h",       channel: "RCS",      segment: "Loyalty Tier Gold",  status: "Sent",    sent: 89  },
  { id: "5", name: "Abandoned Cart Nudge",    channel: "WhatsApp", segment: "Cart Abandoners",    status: "Paused",  sent: 0   },
  { id: "6", name: "Monthly Newsletter Q2",   channel: "Email",    segment: "Email Engaged",      status: "Sent",    sent: 728 },
  { id: "7", name: "Product Drop Alert",      channel: "SMS",      segment: "SMS Opted-In",       status: "Sent",    sent: 502 },
  { id: "8", name: "Referral Rewards Drive",  channel: "Email",    segment: "High-Value Buyers",  status: "Paused",  sent: 0   },
];

// ── Inbox / Contacts ──────────────────────────────────────────────────────────
export const mockInboxContacts = [
  {
    id: "1",
    name: "Sophie Turner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    email: "sophie.turner@gmail.com",
    status: "online",
    lastActive: "2m ago",
    unreadCount: 3,
    channel: "WhatsApp",
    messages: [
      { id: "m1", sender: "contact", text: "Hey! Quick question about my last order.", timestamp: "10:02 AM" },
      { id: "m2", sender: "user",    text: "Hi Sophie! Sure, what's up?",             timestamp: "10:04 AM" },
      { id: "m3", sender: "contact", text: "Was wondering if I could swap the color to navy?", timestamp: "10:05 AM" },
      { id: "m4", sender: "contact", text: "It hasn't shipped yet, right?",           timestamp: "10:05 AM" },
      { id: "m5", sender: "contact", text: "Also, can I add another item to the same order?", timestamp: "10:06 AM" },
    ],
  },
  {
    id: "2",
    name: "James Mitchell",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    email: "j.mitchell@outlook.com",
    status: "offline",
    lastActive: "1h ago",
    unreadCount: 0,
    channel: "Email",
    messages: [
      { id: "m1", sender: "user",    text: "Hi James, following up on the contract.",  timestamp: "9:00 AM" },
      { id: "m2", sender: "contact", text: "Got it, I'll review and sign by EOD.",     timestamp: "9:45 AM" },
      { id: "m3", sender: "user",    text: "Perfect, let me know if you need any changes.", timestamp: "9:47 AM" },
    ],
  },
  {
    id: "3",
    name: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    email: "priya.s@yahoo.com",
    status: "online",
    lastActive: "Just now",
    unreadCount: 1,
    channel: "SMS",
    messages: [
      { id: "m1", sender: "contact", text: "Are there any discounts this week?",       timestamp: "11:00 AM" },
      { id: "m2", sender: "user",    text: "Yes! 20% off on orders above $50 today.",  timestamp: "11:03 AM" },
      { id: "m3", sender: "contact", text: "Amazing! I'll order now.",                 timestamp: "11:10 AM" },
    ],
  },
  {
    id: "4",
    name: "Carlos Mendez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    email: "carlosmendez@proton.me",
    status: "offline",
    lastActive: "3h ago",
    unreadCount: 0,
    channel: "RCS",
    messages: [
      { id: "m1", sender: "user",    text: "Carlos, your shipment is on the way!",     timestamp: "Yesterday" },
      { id: "m2", sender: "contact", text: "Awesome, thanks for the update!",          timestamp: "Yesterday" },
    ],
  },
  {
    id: "5",
    name: "Emily Watson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    email: "emwatson@company.io",
    status: "online",
    lastActive: "5m ago",
    unreadCount: 2,
    channel: "WhatsApp",
    messages: [
      { id: "m1", sender: "contact", text: "I wanted to give feedback on my purchase.", timestamp: "8:30 AM" },
      { id: "m2", sender: "user",    text: "We'd love to hear it! Please go ahead.",   timestamp: "8:35 AM" },
      { id: "m3", sender: "contact", text: "The quality is excellent, but delivery was slow.", timestamp: "8:40 AM" },
      { id: "m4", sender: "contact", text: "Would appreciate faster shipping next time.", timestamp: "8:41 AM" },
    ],
  },
  {
    id: "6",
    name: "Nathan Brooks",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nathan",
    email: "nbrooks@enterprise.com",
    status: "offline",
    lastActive: "Yesterday",
    unreadCount: 0,
    channel: "Email",
    messages: [
      { id: "m1", sender: "contact", text: "Please send me the invoice for March.",    timestamp: "Yesterday" },
      { id: "m2", sender: "user",    text: "Sent! Check your inbox.",                  timestamp: "Yesterday" },
    ],
  },
];

// ── Products ──────────────────────────────────────────────────────────────────
export const mockProducts = [
  { id: "1", name: "Xeno CRM Pro",        category: "Software",    price: 299,  stock: 999, sales: 412,  revenue: 123188, description: "Full-featured CRM with AI segmentation." },
  { id: "2", name: "Analytics Add-on",    category: "Software",    price: 99,   stock: 999, sales: 218,  revenue: 21582,  description: "Advanced revenue analytics module." },
  { id: "3", name: "WhatsApp Connector",  category: "Integration", price: 49,   stock: 999, sales: 875,  revenue: 42875,  description: "Seamless WhatsApp Business API integration." },
  { id: "4", name: "Email Automator",     category: "Integration", price: 79,   stock: 999, sales: 631,  revenue: 49849,  description: "Automated email workflow builder." },
  { id: "5", name: "SMS Gateway Bundle",  category: "Integration", price: 59,   stock: 999, sales: 340,  revenue: 20060,  description: "Bulk SMS send & delivery reports." },
  { id: "6", name: "AI Segment Engine",   category: "AI Module",   price: 149,  stock: 999, sales: 193,  revenue: 28757,  description: "Gemini-powered dynamic audience builder." },
  { id: "7", name: "Campaign Manager",    category: "Software",    price: 129,  stock: 999, sales: 287,  revenue: 37023,  description: "Multi-channel campaign creation & tracking." },
  { id: "8", name: "Unified Inbox",       category: "Software",    price: 89,   stock: 999, sales: 504,  revenue: 44856,  description: "Centralised messaging across all channels." },
];

// ── Projects ──────────────────────────────────────────────────────────────────
// Schema matches projects/page.tsx Project interface
export const mockProjects = [
  {
    id: "1",  clientName: "Sophie Turner",  clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    clientEmail: "sophie.turner",  projectName: "Q2 Email Re-engagement",
    projectDesc: "Automated email follow-up campaign for Q2 lead reactivation.",
    dueDate: "Apr 30", contractValue: 1800, status: "In Progress", hasNote: true,
    notes: "Client wants A/B test results by Apr 15."
  },
  {
    id: "2",  clientName: "Nathan Brooks",  clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nathan",
    clientEmail: "nbrooks",  projectName: "WhatsApp Drip Campaign",
    projectDesc: "7-step drip sequence targeting WhatsApp-preferred segment.",
    dueDate: "May 10", contractValue: 2400, status: "In Progress", hasNote: false,
    notes: ""
  },
  {
    id: "3",  clientName: "Priya Sharma",   clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    clientEmail: "priya.s",  projectName: "Loyalty Tier Migration",
    projectDesc: "Migrate 500+ customers to new Gold loyalty tier program.",
    dueDate: "Mar 31", contractValue: 950, status: "Completed", hasNote: true,
    notes: "Fully migrated, post-campaign report pending."
  },
  {
    id: "4",  clientName: "Carlos Mendez",  clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    clientEmail: "carlosmendez",  projectName: "SMS Opt-In Growth Drive",
    projectDesc: "Drive SMS subscription signups via in-app and web prompts.",
    dueDate: "May 20", contractValue: 1100, status: "In Progress", hasNote: false,
    notes: ""
  },
  {
    id: "5",  clientName: "James Mitchell", clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    clientEmail: "j.mitchell",  projectName: "CRM Onboarding Flow",
    projectDesc: "Set up new CRM workspace and import 200+ customer contacts.",
    dueDate: "May 1", contractValue: 750, status: "Draft", hasNote: true,
    notes: "Waiting on client to share contact CSV export."
  },
  {
    id: "6",  clientName: "Emily Watson",   clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    clientEmail: "emwatson",  projectName: "Cart Abandonment Sequence",
    projectDesc: "3-touch WhatsApp sequence targeting cart abandoners.",
    dueDate: "Apr 25", contractValue: 1350, status: "On Review", hasNote: false,
    notes: ""
  },
  {
    id: "7",  clientName: "Aisha Okafor",   clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
    clientEmail: "aisha.ok",  projectName: "AI Segment Builder Pilot",
    projectDesc: "First live test of Gemini-powered natural language segmentation.",
    dueDate: "Mar 15", contractValue: 600, status: "Completed", hasNote: true,
    notes: "Pilot exceeded expectations — 92% segment accuracy."
  },
  {
    id: "8",  clientName: "David Okonkwo",  clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    clientEmail: "david.ok",  projectName: "Revenue Analytics Dashboard v2",
    projectDesc: "Rebuild revenue charts with AI projection overlays.",
    dueDate: "Jun 1", contractValue: 2100, status: "Recommended", hasNote: false,
    notes: ""
  },
];

// ── AI Draft ─────────────────────────────────────────────────────────────────
export function mockAiDraft(goal: string): string {
  const templates: Record<string, string> = {
    follow: "Hi {{name}}, just checking in to see if everything is going smoothly! We have some exciting updates this week that I think you'll love. Let me know if there's anything I can help with.",
    segment: "Your WhatsApp segment has been automatically updated. 984 contacts are now included based on preferred channel preferences. Ready to launch a campaign?",
    calendar: "Your Q2 newsletter plan has been created:\n• Week 1: Product highlights\n• Week 2: Customer story\n• Week 3: Promotional offer\n• Week 4: Feedback survey",
    conversion: "Your current CVR is 4.7% — 23% above industry average. Top performing segment: 'High-Value Buyers' at 8.2% CVR. Recommended action: Re-run last month's campaign to this segment.",
  };

  const lower = goal.toLowerCase();
  if (lower.includes("follow")) return templates.follow;
  if (lower.includes("segment") || lower.includes("whatsapp")) return templates.segment;
  if (lower.includes("calendar") || lower.includes("newsletter")) return templates.calendar;
  if (lower.includes("conversion") || lower.includes("stat")) return templates.conversion;
  return `Here is an AI-optimised response for: "${goal}". Based on your current segment data, I recommend targeting WhatsApp-preferred customers first for a 22% higher open rate. Shall I draft the full campaign message?`;
}

// ── Campaign Stats ────────────────────────────────────────────────────────────
export function mockCampaignStats(id: string) {
  const campaign = mockCampaigns.find(c => c.id === id) || mockCampaigns[0];
  const sentCount = campaign.sent || 450;
  const delivered = Math.floor(sentCount * 0.97);
  const opened    = Math.floor(sentCount * 0.44);
  const clicked   = Math.floor(sentCount * 0.18);
  const converted = Math.floor(sentCount * 0.047);
  const failed    = sentCount - delivered;
  return {
    id: campaign.id,
    name: campaign.name,
    channel: campaign.channel,
    segment: campaign.segment,
    status: campaign.status,
    message: `Hi {{name}}, check out our latest offer just for you! 🎉`,
    sent: sentCount,
    delivered,
    opened,
    clicked,
    converted,
    failed,
    cvr: "4.7%",
    sentAt: "2025-04-01T14:30:00Z",
    statusBreakdown: {
      delivered,
      failed,
      pending: 0,
    },
    logs: [
      { recipient: "Sophie Turner",   status: "Delivered", timestamp: "2025-04-01T14:31:02Z" },
      { recipient: "James Mitchell",  status: "Opened",    timestamp: "2025-04-01T14:33:45Z" },
      { recipient: "Priya Sharma",    status: "Clicked",   timestamp: "2025-04-01T14:35:10Z" },
      { recipient: "Nathan Brooks",   status: "Delivered", timestamp: "2025-04-01T14:36:00Z" },
      { recipient: "Emily Watson",    status: "Failed",    timestamp: "2025-04-01T14:36:55Z" },
    ],
  };
}

// ── AI Insight (for campaign stats page) ─────────────────────────────────────
export function mockCampaignInsight(id: string) {
  const insights = [
    { insight: "44% open rate — 2× industry average. WhatsApp outperformed Email by 31% in clicks.", action: "Re-run this campaign targeting non-openers with a follow-up sequence." },
    { insight: "Conversion rate of 4.7% matches top-tier benchmarks. Peak engagement occurred between 2–4 PM.", action: "Schedule your next campaign for 2 PM to maximise opens and clicks." },
    { insight: "18% click-through rate is excellent. Most clicks came from the first CTA button.", action: "A/B test a shorter message with a single, bold CTA for the win-back segment." },
    { insight: "Your SMS segment converted 2.3× better than Email. Loyalty tier customers had the highest engagement.", action: "Expand the Loyalty Tier Gold segment by lowering the threshold to $750 LTV." },
  ];
  const idx = parseInt(id || "1") % insights.length;
  return insights[idx];
}

// ── Route Matcher ─────────────────────────────────────────────────────────────
// Returns mock data for any API route, or undefined if not matched.
export async function mockFetch(url: string, options?: RequestInit): Promise<any> {
  const method = options?.method?.toUpperCase() || "GET";
  const path = url.replace(/^https?:\/\/[^/]+/, ""); // strip origin

  // Dashboard
  if (path === "/api/dashboard/summary" && method === "GET")
    return delay(mockDashboardSummary);

  // Customers
  if (path === "/api/customers" && method === "GET")
    return delay({ customers: mockCustomers, total: mockCustomers.length });

  // Segments
  if (path === "/api/segments" && method === "GET")
    return delay(mockSegments);

  if (path.match(/^\/api\/segments\/[^/]+$/) && method === "GET") {
    const id = path.split("/").pop()!;
    return delay(mockSegments.find(s => s.id === id) || mockSegments[0]);
  }

  if (path === "/api/segments" && method === "POST") {
    const body = JSON.parse((options?.body as string) || "{}");
    const newSeg = { id: String(Date.now()), rules: [], count: 0, createdAt: new Date().toISOString(), ...body };
    mockSegments.push(newSeg);
    return delay(newSeg);
  }

  // Campaigns
  if (path === "/api/campaigns" && method === "GET")
    return delay(mockCampaigns);

  if (path.match(/^\/api\/campaigns\/[^/]+$/) && method === "GET") {
    const id = path.split("/").pop()!;
    return delay(mockCampaignStats(id));
  }

  if (path === "/api/campaigns" && method === "POST") {
    const body = JSON.parse((options?.body as string) || "{}");
    const newCamp = { id: String(Date.now()), sent: 0, status: "Paused", ...body };
    mockCampaigns.push(newCamp as any);
    return delay(newCamp);
  }

  if (path.match(/^\/api\/campaigns\/[^/]+\/toggle$/) && method === "POST") {
    const id = path.split("/")[3];
    const camp = mockCampaigns.find(c => c.id === id);
    if (camp) camp.status = camp.status === "Sent" ? "Paused" : "Sent";
    return delay({ status: camp?.status || "Sent" });
  }

  if (path.match(/^\/api\/campaigns\/[^/]+\/launch$/) && method === "POST") {
    const id = path.split("/")[3];
    const camp = mockCampaigns.find(c => c.id === id);
    if (camp) { camp.status = "Sent"; camp.sent = camp.sent || 250; }
    return delay({ ok: true, status: "Sent", sent: camp?.sent || 250 });
  }

  if (path.match(/^\/api\/campaigns\/[^/]+\/stats$/) && method === "GET") {
    const id = path.split("/")[3];
    return delay(mockCampaignStats(id));
  }

  if (path.match(/^\/api\/campaigns\/[^/]+\/insight$/) && method === "GET") {
    const id = path.split("/")[3];
    return delay(mockCampaignInsight(id), 900);
  }

  // Inbox
  if (path === "/api/inbox" && method === "GET")
    return delay(mockInboxContacts);

  if (path.match(/^\/api\/inbox\/[^/]+\/read$/) && method === "PUT") {
    const id = path.split("/")[3];
    const c = mockInboxContacts.find(c => c.id === id);
    if (c) c.unreadCount = 0;
    return delay({ ok: true });
  }

  if (path.match(/^\/api\/inbox\/[^/]+\/messages$/) && method === "POST") {
    const id = path.split("/")[3];
    const body = JSON.parse((options?.body as string) || "{}");
    const now = new Date();
    const msg = {
      id: `m${Date.now()}`,
      sender: body.sender || "user",
      text: body.text || "",
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const c = mockInboxContacts.find(c => c.id === id);
    if (c) c.messages.push(msg as any);
    return delay(msg);
  }

  // Products
  if (path === "/api/products" && method === "GET")
    return delay(mockProducts);

  if (path.match(/^\/api\/products\/[^/]+$/) && method === "GET") {
    const id = path.split("/").pop()!;
    return delay(mockProducts.find(p => p.id === id) || mockProducts[0]);
  }

  // Projects
  if (path === "/api/projects" && method === "GET")
    return delay(mockProjects);

  if (path === "/api/projects" && method === "POST") {
    const body = JSON.parse((options?.body as string) || "{}");
    const newProj = { id: String(Date.now()), clientAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`, hasNote: !!body.notes, ...body };
    (mockProjects as any[]).push(newProj);
    return delay(newProj);
  }

  if (path.match(/^\/api\/projects\/[^/]+$/) && method === "PUT") {
    const id = path.split("/").pop()!;
    const body = JSON.parse((options?.body as string) || "{}");
    const idx = (mockProjects as any[]).findIndex(p => p.id === id);
    if (idx !== -1) Object.assign(mockProjects[idx], { ...body, hasNote: !!body.notes });
    return delay(mockProjects[idx] || {});
  }

  if (path.match(/^\/api\/projects\/[^/]+$/) && method === "DELETE") {
    const id = path.split("/").pop()!;
    const idx = (mockProjects as any[]).findIndex(p => p.id === id);
    if (idx !== -1) (mockProjects as any[]).splice(idx, 1);
    return delay({ ok: true });
  }

  // Receipts / Orders
  if (path === "/api/receipts" && method === "GET")
    return delay([
      { id: "r1", customer: "Sophie Turner",  amount: 299,  date: "2025-04-01", status: "Paid"    },
      { id: "r2", customer: "James Mitchell", amount: 148,  date: "2025-04-02", status: "Paid"    },
      { id: "r3", customer: "Priya Sharma",   amount: 49,   date: "2025-04-03", status: "Pending" },
      { id: "r4", customer: "Carlos Mendez",  amount: 79,   date: "2025-04-04", status: "Paid"    },
      { id: "r5", customer: "Emily Watson",   amount: 229,  date: "2025-04-05", status: "Refunded"},
    ]);

  // AI endpoints
  if ((path === "/api/ai/draft" || path === "/api/ai/inbox-draft") && method === "POST") {
    const body = JSON.parse((options?.body as string) || "{}");
    const goal = body.goal || body.contactName || "message";
    return delay({ draft: mockAiDraft(goal) }, 800);
  }

  if (path === "/api/ai/segment" && method === "POST") {
    return delay({
      name: "AI Generated Segment",
      rules: [{ field: "ltv", op: "gt", value: 500 }],
      count: Math.floor(Math.random() * 400) + 100,
      preview: mockCustomers.slice(0, 5),
    }, 1200);
  }

  // Fallback: not matched
  return undefined;
}
