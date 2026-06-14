import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const PORT = 3000;

// -- IN-MEMORY DB --
const mockDb = {
  customers: [
    { id: "1", name: "Alice Smith", email: "alice@example.com", phone: "+1234567890", channel: "Email", purchase_count: 5, last_active: "2026-05-15T10:00:00Z", total_spent: 250 },
    { id: "2", name: "Bob Jones", email: "bob@example.com", phone: "+1987654321", channel: "WhatsApp", purchase_count: 1, last_active: "2026-06-08T14:30:00Z", total_spent: 45 },
    { id: "3", name: "Charlie Brown", email: "charlie@example.com", phone: "+1555666777", channel: "SMS", purchase_count: 12, last_active: "2026-06-09T09:15:00Z", total_spent: 890 },
    { id: "4", name: "Diana Prince", email: "diana@example.com", phone: "+1444555666", channel: "WhatsApp", purchase_count: 0, last_active: "2026-04-20T18:00:00Z", total_spent: 0 },
    { id: "5", name: "Evan Wright", email: "evan@example.com", phone: "+1333444555", channel: "Email", purchase_count: 8, last_active: "2026-06-01T11:45:00Z", total_spent: 420 },
    { id: "6", name: "Fiona Gallagher", email: "fiona@example.com", phone: "+1222333444", channel: "RCS", purchase_count: 3, last_active: "2026-05-28T16:20:00Z", total_spent: 130 },
    { id: "7", name: "George Clark", email: "george@example.com", phone: "+1888999000", channel: "SMS", purchase_count: 2, last_active: "2026-06-07T12:00:00Z", total_spent: 75 },
    { id: "8", name: "Hannah Abbott", email: "hannah@example.com", phone: "+1777888999", channel: "Email", purchase_count: 15, last_active: "2026-06-09T17:50:00Z", total_spent: 1540 },
    { id: "9", name: "Ian Malcolm", email: "ian@example.com", phone: "+1666777888", channel: "WhatsApp", purchase_count: 4, last_active: "2026-05-10T08:30:00Z", total_spent: 195 },
    { id: "10", name: "Julia Roberts", email: "julia@example.com", phone: "+1999000111", channel: "RCS", purchase_count: 0, last_active: "2026-03-15T15:00:00Z", total_spent: 0 }
  ],
  segments: [
    { id: "1", name: "Active Buyers", rules: [{ field: "purchase_count", op: ">", value: "3" }], count: 5, createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: "2", name: "Lapsed Customers", rules: [{ field: "last_active", op: ">", value: "30" }], count: 3, createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
    { id: "3", name: "WhatsApp Fans", rules: [{ field: "channel", op: "==", value: "WhatsApp" }], count: 3, createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
  ],
  campaigns: [
    { id: "1", name: "Spring Sale", channel: "Email", segment: "Active Buyers", status: "Sent", sent: 120, createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: "2", name: "Re-engage Promo", channel: "WhatsApp", segment: "Lapsed Customers", status: "Sending", sent: 85, createdAt: new Date(Date.now() - 10000).toISOString() }
  ],
  products: [
    { id: "1", name: "Premium Leather Jacket", category: "Apparel", price: 199.99, stock: 45, sales: 85, revenue: 16999.15, description: "Genuine leather jacket with premium zippers and lining." },
    { id: "2", name: "Wireless Noise-Canceling Headphones", category: "Electronics", price: 299.99, stock: 30, sales: 50, revenue: 14999.50, description: "Over-ear bluetooth headphones with active noise cancellation." },
    { id: "3", name: "Smart Fitness Watch", category: "Electronics", price: 149.99, stock: 80, sales: 120, revenue: 17998.80, description: "Waterproof fitness tracker with heart rate monitor." },
    { id: "4", name: "Organic Cotton T-Shirt", category: "Apparel", price: 24.99, stock: 150, sales: 250, revenue: 6247.50, description: "Eco-friendly basic t-shirt made of 100% organic cotton." },
    { id: "5", name: "Ergonomic Office Chair", category: "Furniture", price: 349.99, stock: 12, sales: 15, revenue: 5249.85, description: "Adjustable height office chair with lumbar support." }
  ],
  projects: [
    { id: "1", clientName: "Sophie T.", clientAvatar: "https://i.pravatar.cc/100?img=32", clientEmail: "sophie.turner", projectName: "Garden Grove Designs", projectDesc: "Mobile Application Design", dueDate: "Apr 2", contractValue: 25.00, status: "Draft", hasNote: true, notes: "Needs final client confirmation on style guides." },
    { id: "2", clientName: "Sam S.", clientAvatar: "https://i.pravatar.cc/100?img=12", clientEmail: "sam.smith", projectName: "Flora & Fauna Studio", projectDesc: "Online Shopping Platform", dueDate: "Apr 1", contractValue: 50.00, status: "In Progress", hasNote: true, notes: "Product page backend integration in progress." },
    { id: "3", clientName: "Olivia P.", clientAvatar: "https://i.pravatar.cc/100?img=47", clientEmail: "olivia.peterson", projectName: "Vibrant Vases Studio", projectDesc: "Digital Commerce Platform", dueDate: "Apr 1", contractValue: 225.00, status: "On Review", hasNote: true, notes: "Reviewing layout suggestions and color palettes." }
  ],
  inbox: [
    {
      id: "1",
      name: "Sophie T.",
      avatar: "https://i.pravatar.cc/100?img=32",
      email: "sophie.turner@example.com",
      status: "online",
      lastActive: "8 hours ago",
      unreadCount: 0,
      channel: "WhatsApp",
      messages: [
        { id: "101", sender: "contact", text: "Hi! Your portfolio is impressive. Looking for a designer for a tech startup landing page. Are you available?", timestamp: "Apr 1, 2025, 3:08 PM" },
        { id: "102", sender: "user", text: "Hi! Yes, I'm available. What do you need help with?", timestamp: "Apr 1, 2025, 3:09 PM" },
        { id: "103", sender: "contact", text: "Great! Before we dive into details, can you tell me about your work process and pricing?", timestamp: "Apr 1, 2025, 3:09 PM" }
      ]
    },
    {
      id: "2",
      name: "Liam K.",
      avatar: "https://i.pravatar.cc/100?img=11",
      email: "liam.k@example.com",
      status: "online",
      lastActive: "1 day ago",
      unreadCount: 1,
      channel: "Email",
      messages: [
        { id: "201", sender: "contact", text: "I'm thrilled to dive into our possibilities.", timestamp: "Apr 1, 2025, 10:30 AM" }
      ]
    },
    {
      id: "3",
      name: "Olivia P.",
      avatar: "https://i.pravatar.cc/100?img=47",
      email: "olivia.p@example.com",
      status: "online",
      lastActive: "2 days ago",
      unreadCount: 0,
      channel: "Email",
      messages: [
        { id: "301", sender: "contact", text: "Hope you're doing well! Just checking in to see if you reviewed the layout.", timestamp: "Mar 30, 2025, 4:15 PM" }
      ]
    },
    {
      id: "4",
      name: "Noah J.",
      avatar: "https://i.pravatar.cc/100?img=3",
      email: "noah.j@example.com",
      status: "offline",
      lastActive: "4 days ago",
      unreadCount: 0,
      channel: "WhatsApp",
      messages: [
        { id: "401", sender: "contact", text: "I'm excited about what we can achieve.", timestamp: "Mar 28, 2025, 11:00 AM" }
      ]
    },
    {
      id: "5",
      name: "Sam W.",
      avatar: "https://i.pravatar.cc/100?img=14",
      email: "sam.w@example.com",
      status: "online",
      lastActive: "4 days ago",
      unreadCount: 0,
      channel: "SMS",
      messages: [
        { id: "501", sender: "contact", text: "Let me know if you have time to go over them tomorrow.", timestamp: "Mar 28, 2025, 2:30 PM" }
      ]
    },
    {
      id: "6",
      name: "Ava M.",
      avatar: "https://i.pravatar.cc/100?img=5",
      email: "ava.m@example.com",
      status: "online",
      lastActive: "5 days ago",
      unreadCount: 0,
      channel: "RCS",
      messages: [
        { id: "601", sender: "contact", text: "The latest version looks great! I have a few minor tweaks.", timestamp: "Mar 27, 2025, 9:00 AM" }
      ]
    },
    {
      id: "7",
      name: "Ethan S.",
      avatar: "https://i.pravatar.cc/100?img=8",
      email: "ethan.s@example.com",
      status: "online",
      lastActive: "8 days ago",
      unreadCount: 2,
      channel: "WhatsApp",
      messages: [
        { id: "701", sender: "contact", text: "Hey! Just wanted to follow up.", timestamp: "Mar 24, 2025, 1:20 PM" },
        { id: "702", sender: "contact", text: "I'm looking forward to what we can invent.", timestamp: "Mar 24, 2025, 1:45 PM" }
      ]
    }
  ]
};

// -- RULE EVALUATOR FOR SEGMENTS --
function evaluateRules(customer: any, rules: any[]) {
  if (!rules || rules.length === 0) return true;
  return rules.every(rule => {
    let { field, op, value } = rule;
    let customerVal = customer[field];
    if (customerVal === undefined) return false;

    // Type coercion
    if (field === "purchase_count" || field === "total_spent") {
      const cNum = Number(customerVal);
      const rNum = Number(value);
      if (isNaN(cNum) || isNaN(rNum)) return false;
      if (op === ">") return cNum > rNum;
      if (op === "<") return cNum < rNum;
      if (op === "==" || op === "=") return cNum === rNum;
      if (op === "!=") return cNum !== rNum;
      return false;
    }

    if (field === "last_active") {
      const lastActiveDate = new Date(customerVal);
      const diffTime = Math.abs(Date.now() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rNum = Number(value);
      if (isNaN(rNum)) return false;
      if (op === ">") return diffDays > rNum;
      if (op === "<") return diffDays < rNum;
      if (op === "==" || op === "=") return diffDays === rNum;
      if (op === "!=") return diffDays !== rNum;
      return false;
    }

    if (field === "channel") {
      const cStr = String(customerVal).toLowerCase();
      const rStr = String(value).toLowerCase();
      if (op === "==" || op === "=") return cStr === rStr;
      if (op === "!=") return cStr !== rStr;
      return false;
    }

    return false;
  });
}

// Cache for campaign live statistics polling
const statsCache: Record<string, { sent: number, delivered: number, opened: number, clicked: number, converted: number, lastUpdate: number }> = {};

async function startServer() {
  const app = express();
  app.use(express.json());

  // -- API ROUTES --
  app.get("/api/dashboard/summary", (req, res) => {
    const totalSent = mockDb.campaigns.reduce((acc, c) => acc + c.sent, 0);
    res.json({
      metrics: { 
        customers: mockDb.customers.length, 
        campaigns: mockDb.campaigns.length, 
        sent: totalSent, 
        cvr: 4.2,
        clients: 14,
        clientsComparison: "+4",
        clientsSubtitle: "Compare 10 (last month)",
        revenue: 3552,
        revenueComparison: "-8%",
        revenueSubtitle: "$3,720.00 (last month)",
        projects: 22,
        projectsComparison: "+6",
        projectsSubtitle: "Compare 16 (last month)"
      },
      recentCampaigns: mockDb.campaigns,
      feed: [
        { id: "1", text: "Alice opened Spring Sale", time: "2 min ago" },
        { id: "2", text: "Bob purchased via WhatsApp", time: "5 min ago" },
        { id: "3", text: "Diana opted in to RCS notifications", time: "15 min ago" }
      ]
    });
  });

  app.get("/api/customers", (req, res) => res.json(mockDb.customers));
  
  app.get("/api/segments", (req, res) => res.json(mockDb.segments));
  
  app.get("/api/segments/:id", (req, res) => {
    const segment = mockDb.segments.find(s => s.id === req.params.id);
    if (!segment) return res.status(404).json({ error: "Segment not found" });
    res.json(segment);
  });

  app.post("/api/segments", (req, res) => {
    const { name, rules } = req.body;
    const matched = mockDb.customers.filter(c => evaluateRules(c, rules));
    const newSegment = {
      id: String(mockDb.segments.length + 1),
      name: name || `Segment ${mockDb.segments.length + 1}`,
      rules: rules || [],
      count: matched.length,
      createdAt: new Date().toISOString()
    };
    mockDb.segments.push(newSegment);
    res.json(newSegment);
  });

  app.post("/api/segments/preview", (req, res) => {
    const { rules } = req.body;
    const matched = mockDb.customers.filter(c => evaluateRules(c, rules));
    res.json({
      count: matched.length,
      sample: matched.slice(0, 5)
    });
  });


  app.get("/api/products", (req, res) => res.json(mockDb.products));
  
  app.get("/api/products/:id", (req, res) => {
    const product = mockDb.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  app.post("/api/products", (req, res) => {
    const { name, category, price, stock, description } = req.body;
    const newProduct = {
      id: String(mockDb.products.length + 1),
      name: name || `Product ${mockDb.products.length + 1}`,
      category: category || "General",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      sales: 0,
      revenue: 0,
      description: description || ""
    };
    mockDb.products.push(newProduct);
    res.json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const productIndex = mockDb.products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" });
    
    const { name, category, price, stock, description } = req.body;
    mockDb.products[productIndex] = {
      ...mockDb.products[productIndex],
      name: name !== undefined ? name : mockDb.products[productIndex].name,
      category: category !== undefined ? category : mockDb.products[productIndex].category,
      price: price !== undefined ? Number(price) : mockDb.products[productIndex].price,
      stock: stock !== undefined ? Number(stock) : mockDb.products[productIndex].stock,
      description: description !== undefined ? description : mockDb.products[productIndex].description
    };
    res.json(mockDb.products[productIndex]);
  });

  app.delete("/api/products/:id", (req, res) => {
    const productIndex = mockDb.products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" });
    const deleted = mockDb.products.splice(productIndex, 1);
    res.json(deleted[0]);
  });

  // -- PROJECTS REST API --
  app.get("/api/projects", (req, res) => {
    res.json(mockDb.projects || []);
  });

  app.post("/api/projects", (req, res) => {
    const { clientName, clientEmail, projectName, projectDesc, dueDate, contractValue, status, notes } = req.body;
    const randomImgNum = Math.floor(Math.random() * 70) + 1;
    const clientAvatar = `https://i.pravatar.cc/100?img=${randomImgNum}`;
    
    const newProject = {
      id: String((mockDb.projects || []).length + 1),
      clientName: clientName || "Anonymous Client",
      clientEmail: clientEmail || "anonymous",
      clientAvatar,
      projectName: projectName || "New Objective",
      projectDesc: projectDesc || "No description provided.",
      dueDate: dueDate || "TBD",
      contractValue: Number(contractValue) || 0,
      status: status || "Draft",
      hasNote: !!notes,
      notes: notes || ""
    };
    
    mockDb.projects.push(newProject);
    res.json(newProject);
  });

  app.put("/api/projects/:id", (req, res) => {
    const projectIndex = mockDb.projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) return res.status(404).json({ error: "Project not found" });
    
    const { clientName, clientEmail, projectName, projectDesc, dueDate, contractValue, status, notes } = req.body;
    const project = mockDb.projects[projectIndex];
    
    mockDb.projects[projectIndex] = {
      ...project,
      clientName: clientName !== undefined ? clientName : project.clientName,
      clientEmail: clientEmail !== undefined ? clientEmail : project.clientEmail,
      projectName: projectName !== undefined ? projectName : project.projectName,
      projectDesc: projectDesc !== undefined ? projectDesc : project.projectDesc,
      dueDate: dueDate !== undefined ? dueDate : project.dueDate,
      contractValue: contractValue !== undefined ? Number(contractValue) : project.contractValue,
      status: status !== undefined ? status : project.status,
      notes: notes !== undefined ? notes : project.notes,
      hasNote: notes !== undefined ? !!notes : project.hasNote
    };
    
    res.json(mockDb.projects[projectIndex]);
  });

  app.delete("/api/projects/:id", (req, res) => {
    const projectIndex = mockDb.projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) return res.status(404).json({ error: "Project not found" });
    const deleted = mockDb.projects.splice(projectIndex, 1);
    res.json(deleted[0]);
  });

  // -- INBOX REST API --
  app.get("/api/inbox", (req, res) => {
    res.json(mockDb.inbox || []);
  });

  app.post("/api/inbox/:contactId/messages", (req, res) => {
    const contact = mockDb.inbox.find(c => c.id === req.params.contactId);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    
    const { text, sender } = req.body;
    const newMessage = {
      id: String(contact.messages.length + 101),
      sender: sender || "user",
      text: text || "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
    
    contact.messages.push(newMessage);
    contact.lastActive = "Just now";
    
    if (sender === "contact") {
      contact.unreadCount += 1;
    }
    
    res.json(newMessage);
  });

  app.put("/api/inbox/:contactId/read", (req, res) => {
    const contact = mockDb.inbox.find(c => c.id === req.params.contactId);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    contact.unreadCount = 0;
    res.json({ success: true });
  });

  app.post("/api/ai/inbox-draft", async (req, res) => {
    try {
      const { conversationHistory, contactName } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Review this conversation history with client ${contactName}:
        ${JSON.stringify(conversationHistory)}
        
        Generate a professional, friendly, and brief reply. Under 50 words. Do not wrap in quotes or add prefix.`,
        config: { systemInstruction: "You are an expert CRM assistant drafting replies to clients." }
      });
      res.json({ draft: response.text?.trim() });
    } catch (error: any) {
      res.json({ draft: "Hi! Thanks for reaching out. Let me look into this and I will get back to you shortly." });
    }
  });

  app.get("/api/campaigns", (req, res) => res.json(mockDb.campaigns));

  app.get("/api/campaigns/:id", (req, res) => {
    const campaign = mockDb.campaigns.find(c => c.id === req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  });

  app.post("/api/campaigns", (req, res) => {
    const { name, channel, segment, message } = req.body;
    const targetSegment = mockDb.segments.find(s => s.name === segment);
    const sentCount = targetSegment ? targetSegment.count : 10;
    const newCampaign = {
      id: String(mockDb.campaigns.length + 1),
      name: name || `Campaign ${mockDb.campaigns.length + 1}`,
      channel: channel || "Email",
      segment: segment || "All Users",
      status: "Sending",
      sent: sentCount,
      message: message || "",
      createdAt: new Date().toISOString()
    };
    mockDb.campaigns.push(newCampaign);
    res.json(newCampaign);
  });

  app.post("/api/campaigns/:id/toggle", (req, res) => {
    const campaign = mockDb.campaigns.find(c => c.id === req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    
    if (campaign.status === "Sending") {
      campaign.status = "Paused";
    } else if (campaign.status === "Paused") {
      campaign.status = "Sending";
    } else {
      campaign.status = "Paused";
    }
    
    if (statsCache[campaign.id]) {
      statsCache[campaign.id].lastUpdate = Date.now();
    }
    res.json(campaign);
  });

  app.get("/api/campaigns/:id/stats", (req, res) => {
    const campaign = mockDb.campaigns.find(c => c.id === req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const totalSent = campaign.sent;
    let cached = statsCache[campaign.id];
    const now = Date.now();

    if (!cached) {
      if (campaign.status === "Sent") {
        cached = {
          sent: totalSent,
          delivered: Math.floor(totalSent * 0.98),
          opened: Math.floor(totalSent * 0.7),
          clicked: Math.floor(totalSent * 0.35),
          converted: Math.floor(totalSent * 0.1),
          lastUpdate: now
        };
      } else if (campaign.status === "Paused") {
        cached = {
          sent: Math.floor(totalSent * 0.5),
          delivered: Math.floor(totalSent * 0.49),
          opened: Math.floor(totalSent * 0.3),
          clicked: Math.floor(totalSent * 0.1),
          converted: Math.floor(totalSent * 0.02),
          lastUpdate: now
        };
      } else {
        cached = {
          sent: Math.max(1, Math.floor(totalSent * 0.1)),
          delivered: Math.max(1, Math.floor(totalSent * 0.09)),
          opened: Math.max(0, Math.floor(totalSent * 0.05)),
          clicked: Math.max(0, Math.floor(totalSent * 0.01)),
          converted: 0,
          lastUpdate: now
        };
      }
      statsCache[campaign.id] = cached;
    } else {
      if (campaign.status === "Sending" && now - cached.lastUpdate > 3000) {
        const remaining = totalSent - cached.sent;
        if (remaining > 0) {
          const increment = Math.max(1, Math.floor(remaining * 0.4));
          cached.sent = Math.min(totalSent, cached.sent + increment);
          cached.delivered = Math.min(cached.sent, Math.floor(cached.sent * 0.98));
          cached.opened = Math.min(cached.delivered, Math.floor(cached.delivered * 0.7));
          cached.clicked = Math.min(cached.opened, Math.floor(cached.opened * 0.35));
          cached.converted = Math.min(cached.clicked, Math.floor(cached.clicked * 0.1));
          
          if (cached.sent === totalSent) {
            campaign.status = "Sent";
          }
        }
        cached.lastUpdate = now;
      }
    }

    const failed = Math.max(0, cached.sent - cached.delivered);
    res.json({
      sent: cached.sent,
      delivered: cached.delivered,
      opened: cached.opened,
      clicked: cached.clicked,
      converted: cached.converted,
      statusBreakdown: {
        delivered: cached.delivered,
        failed: failed,
        pending: campaign.status === "Sending" ? totalSent - cached.sent : 0
      }
    });
  });

  app.get("/api/campaigns/:id/insight", async (req, res) => {
    try {
      const campaign = mockDb.campaigns.find(c => c.id === req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });

      const stats = statsCache[campaign.id] || {
        sent: campaign.sent,
        delivered: Math.floor(campaign.sent * 0.98),
        opened: Math.floor(campaign.sent * 0.7),
        clicked: Math.floor(campaign.sent * 0.35),
        converted: Math.floor(campaign.sent * 0.1)
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze these campaign stats for a ${campaign.channel} campaign named "${campaign.name}" sent to segment "${campaign.segment}":
        Sent: ${stats.sent}
        Delivered: ${stats.delivered}
        Opened: ${stats.opened}
        Clicked: ${stats.clicked}
        Converted: ${stats.converted}
        
        Generate a structured JSON output with:
        - "insight": a short 1-2 sentence CRM performance analysis.
        - "action": a concrete suggested follow-up action (under 20 words).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insight: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ["insight", "action"]
          }
        }
      });
      
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      res.json({
        insight: "Campaign engagement metrics are within standard benchmarks. Click-to-conversion rate is steady.",
        action: "Send a reminder email to non-openers in 48 hours."
      });
    }
  });

  app.post("/api/ai/draft", async (req, res) => {
    try {
      const { goal, segment, channel } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Draft a very short ${channel} message for segment: ${segment}. Goal: ${goal}. Under 160 chars.`,
        config: { systemInstruction: "You are an expert CRM copywriter." }
      });
      res.json({ draft: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/segment", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Convert this nl request into segment rules: "${text}". 
        Fields: purchase_count, last_active, total_spent, channel.
        Ops: >, <, ==, !=.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                field: { type: Type.STRING },
                op: { type: Type.STRING },
                value: { type: Type.STRING }
              }
            }
          }
        }
      });
      res.json({ rules: JSON.parse(response.text || "[]") });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -- VITE MIDDLEWARE --
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
