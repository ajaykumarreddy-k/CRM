<div align="center">
  <h1>⚡ XENO Mini CRM</h1>
  <p><strong>AI-Native Customer Relationship Management for Reaching Shoppers</strong></p>
  <p><em>Take-Home Engineering Assignment — Xeno</em></p>

  <p>
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google" />
    <img src="https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=flat-square&logo=sqlite" />
    <img src="https://img.shields.io/badge/uv-Package_Manager-DE5FE9?style=flat-square" />
  </p>
</div>

---

## 🎯 What I Built

A fully functional, **AI-native Mini CRM** for a Direct-to-Consumer fashion/retail brand. The product helps marketers:

1. **Decide who to talk to** — an AI-powered segment builder converts natural language into structured audience rules
2. **Know what to say** — Gemini drafts personalised campaign copy per channel and audience
3. **Reach them** — campaigns dispatch via a real two-service, callback-driven architecture (WhatsApp, SMS, Email, RCS)
4. **Understand performance** — a live campaign stats page shows a full funnel: sent → delivered → opened → read → clicked → converted

> **Key product bet:** I chose a *hybrid AI* model — a clean marketer-friendly UI with AI woven into every key step (segment creation, message drafting, insight surfacing, inbox replies). This is more opinionated and actionable than a pure chat-first interface for this use case.

---

## ⚡ Current Running State

> **Backend is halted** — ports 8000/8001 are occupied by other running processes. **Only the frontend is currently active** at `http://localhost:5173`.
>
> To start the backend: `cd backend && uv run crm` (terminal 1) and `uv run channel` (terminal 2).

---

## 🧪 Test Results — 23/23 Passing

```
✅  Health
✅  Dashboard Summary
✅  List Customers
✅  Search Customers
✅  Filter by Channel
✅  List Segments
✅  Get Segment
✅  Preview Segment
✅  Create Segment
✅  List Campaigns
✅  Get Campaign
✅  Campaign Stats
✅  Toggle Campaign
✅  Create Campaign
✅  List Products
✅  Update Product
✅  Create Product
✅  List Inbox Contacts
✅  Send Message
✅  Mark as Read
✅  List Projects
✅  Update Project
✅  Create Project

23/23 tests passed — 🎉 All tests passed! Backend is fully integrated.
```

---

## ✅ Assignment Requirements Checklist

| Requirement | Status | Implementation |
|---|---|---|
| Ingest customers & orders | ✅ | `Customer` + `Order` models, seeded with realistic DTC data |
| Segment shoppers by behaviour | ✅ | Rule engine: `total_spend`, `order_count`, `days_since_last_order`, `channel_pref` |
| AI-powered segmentation | ✅ | Natural language → rules JSON via Gemini (`POST /api/ai/segment`) |
| Send personalised messages | ✅ | `[name]` personalisation, dispatched per-customer in BackgroundTask |
| Separate channel service stub | ✅ | `channel_service.py` on port 8001, separate FastAPI app |
| Full callback lifecycle | ✅ | `sent → delivered → opened → read → clicked → converted/failed` |
| Idempotent receipt ingestion | ✅ | `UNIQUE(communication_id, event_type)` + forward-only status progression |
| Campaign performance insights | ✅ | Full funnel stats + AI insight card per campaign |
| AI message drafting | ✅ | Gemini drafts copy per channel/goal/audience |
| AI conversational assistant | ✅ | `/ai` chat page with action routing (segment, draft, Q&A) |
| AI inbox smart reply | ✅ | Generates contextual reply from conversation history |
| Multi-channel support | ✅ | WhatsApp, SMS, Email, RCS throughout |
| Project tracker | ✅ | Full CRUD `/api/projects` + frontend project management page |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    XENO CRM Frontend (React)                     │
│  Dashboard │ Customers │ Segments │ Campaigns │ Inbox │ AI Chat  │
└───────────────────────┬─────────────────────────────────────────┘
                        │ REST API  (CORS: all origins for demo)
┌───────────────────────▼─────────────────────────────────────────┐
│              CRM Backend — FastAPI  (port 8000)                  │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ /segments│  │/campaigns│  │ /ai/draft  │  │  /receipts   │  │
│  │ engine   │  │ sender   │  │ /ai/segment│  │  ingestion   │  │
│  └──────────┘  └────┬─────┘  └────────────┘  └──────┬───────┘  │
│                     │ POST /send                      │ callback  │
│  ┌──────────────────▼─────────────────────────────────▼───────┐ │
│  │         SQLite DB (SQLAlchemy ORM)                          │ │
│  │  Customers │ Orders │ Segments │ Campaigns │ Communications │ │
│  │  Receipts  │ InboxMessages │ Products │ Projects            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                     │                       ▲                    │
└─────────────────────┼───────────────────────┼────────────────────┘
                      │ POST /send            │ POST /api/receipts
          ┌───────────▼───────────────────────┴──────────┐
          │     Channel Stub Service  (port 8001)         │
          │                                               │
          │  Simulates: sent → delivered → opened →       │
          │             read → clicked → converted/failed │
          │  ~10% fail, ~60% open, ~30% click, ~20% CVR  │
          └───────────────────────────────────────────────┘
                      │ calls
          ┌───────────▼───────────┐
          │  Google Gemini API    │
          │  (gemini-1.5-flash)   │
          └───────────────────────┘
```

### Key Design Decisions & Tradeoffs

| Decision | Reasoning | Tradeoff |
|---|---|---|
| **SQLite** for DB | Zero-config, perfectly adequate for demo | Would use PostgreSQL at scale; SQLAlchemy makes migration trivial |
| **BackgroundTasks** for dispatch | Non-blocking campaign sends; request returns immediately | No retry queue — at scale, use Celery/BullMQ |
| **Forward-only status** in receipt ingestion | Prevents race conditions from out-of-order callbacks | Can't re-open a closed event (correct CRM behaviour) |
| **Idempotent receipts** via UNIQUE constraint | Handles duplicate callbacks gracefully without extra logic | DB-level dedup is simpler than an in-memory seen-set |
| **Channel stub as separate FastAPI app** | Mirrors real two-service architecture; can be deployed independently | Shared memory in dev; at scale, needs a real message queue (SQS/Kafka) |
| **Gemini 1.5 Flash** | Fast, cheap, good at JSON/text generation | GPT-4 would be more capable but adds API key complexity |
| **HashRouter** in React | Works with static file deployment without server rewrites | URLs show `#/` prefix |

---

## 📂 Folder Structure

```
zip/
├── LaunchPage/                 # Static marketing landing page (HTML/CSS/JS)
│   └── index.html
├── front end/                  # React CRM Dashboard (Vite + Tailwind)
│   ├── src/
│   │   ├── app/                # Page components per route
│   │   │   ├── dashboard/      # KPI overview, revenue chart, AI chat widget
│   │   │   ├── customers/      # Searchable customer table
│   │   │   ├── segments/       # Segment cards + AI rule builder
│   │   │   ├── campaigns/      # Campaign list, new campaign wizard, stats
│   │   │   ├── inbox/          # Unified message threads + AI reply drafts
│   │   │   ├── products/       # Product catalog CRUD
│   │   │   ├── projects/       # Project tracker
│   │   │   └── ai/             # Conversational AI assistant
│   │   ├── components/         # Sidebar, Topbar, shared UI primitives
│   │   └── lib/                # api.ts, toast.ts, utils.ts
│   └── package.json            # Managed by bun
└── backend/                    # FastAPI Python server
    ├── routers/
    │   ├── campaigns.py        # CRUD + stats + AI insight + toggle
    │   ├── segments.py         # CRUD + preview + AI rule parsing
    │   ├── customers.py        # Paginated search/filter
    │   ├── receipts.py         # Idempotent callback ingestion
    │   ├── ai.py               # /segment, /draft, /insight, /chat, /inbox-draft
    │   ├── dashboard.py        # Aggregate KPIs + activity feed
    │   ├── inbox.py            # Threaded contact messages
    │   ├── products.py         # Product catalog CRUD
    │   └── projects.py         # Project tracker CRUD
    ├── services/
    │   ├── campaign_sender.py  # Background task: dispatch → channel service
    │   ├── segment_engine.py   # JSON rules evaluation engine
    │   └── gemini.py           # Thin Gemini 1.5 Flash wrapper
    ├── models.py               # SQLAlchemy ORM models
    ├── schemas.py              # Pydantic v2 request/response schemas
    ├── channel_service.py      # Separate stub service (port 8001)
    ├── seed.py                 # Realistic DTC seed data
    ├── test_api.py             # End-to-end API test suite
    └── pyproject.toml          # uv-managed dependencies + scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+ and [`uv`](https://github.com/astral-sh/uv)
- Node.js 18+ and [`bun`](https://bun.sh)
- A `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Backend Setup

```bash
cd backend

# Install all dependencies
uv sync

# Set environment variables
cp .env.example .env
# Edit .env and set: GEMINI_API_KEY=your_key_here

# Seed the database with realistic DTC data
uv run seed

# Start the CRM API (port 8000)
uv run crm

# In a second terminal: start the channel stub (port 8001)
uv run channel

# Run the API test suite to verify all endpoints
uv run test
```

### 2. Frontend Setup

```bash
cd "front end"
bun install
bun run dev
# → http://localhost:5173
```

### 3. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | — | **Required** for AI features |
| `CHANNEL_SERVICE_URL` | `http://localhost:8001` | URL of the channel stub |
| `CRM_RECEIPT_URL` | `http://localhost:8000/api/receipts` | URL for channel callbacks |

---

## 🔌 API Reference

Full interactive docs at **http://localhost:8000/docs** (Swagger UI) and **http://localhost:8000/redoc** (ReDoc).

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/dashboard/summary` | KPIs, recent campaigns, activity feed |
| `GET` | `/api/customers` | Paginated, searchable customer list |
| `GET` | `/api/segments` | List all segments |
| `POST` | `/api/segments` | Create segment |
| `POST` | `/api/segments/preview` | Preview audience size before saving |
| `GET` | `/api/segments/{id}` | Get single segment |
| `DELETE` | `/api/segments/{id}` | Delete segment |
| `GET` | `/api/campaigns` | List all campaigns |
| `POST` | `/api/campaigns` | Create campaign (fires background dispatch) |
| `GET` | `/api/campaigns/{id}` | Get single campaign |
| `DELETE` | `/api/campaigns/{id}` | Delete campaign |
| `POST` | `/api/campaigns/{id}/toggle` | Pause/resume a campaign |
| `GET` | `/api/campaigns/{id}/stats` | Full funnel stats + statusBreakdown |
| `GET` | `/api/campaigns/{id}/insight` | Gemini AI analysis of campaign results |
| `POST` | `/api/receipts` | Callback from channel service (idempotent) |
| `POST` | `/api/ai/segment` | NL prompt → segment rules JSON |
| `POST` | `/api/ai/draft` | Generate campaign message copy |
| `POST` | `/api/ai/insight` | AI analysis from raw stats dict |
| `POST` | `/api/ai/inbox-draft` | Smart reply for inbox threads |
| `POST` | `/api/ai/chat` | Conversational CRM assistant |
| `GET` | `/api/products` | List products with catalog stats |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/{id}` | Update product |
| `DELETE` | `/api/products/{id}` | Delete product |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create project |
| `PUT` | `/api/projects/{id}` | Update project |
| `DELETE` | `/api/projects/{id}` | Delete project |
| `GET` | `/api/inbox` | Threaded inbox contact list |
| `POST` | `/api/inbox/{customer_id}/messages` | Send message in thread |
| `PUT` | `/api/inbox/{customer_id}/read` | Mark messages as read |
| `POST` | `http://localhost:8001/send` | Channel stub send endpoint |

---

## 🧪 Automated Testing

```bash
cd backend
uv run crm          # start the server first (terminal 1)
python test_api.py  # run tests (terminal 2)
```

The test suite (`test_api.py`) validates all 23 endpoints end-to-end including segment preview, campaign creation, product CRUD, inbox messaging, project tracking, and the full channel callback loop.

**Result: 23/23 tests pass ✅**

---

## 📐 Scale Assumptions & Explicit Tradeoffs

This is a demo-scale system. Here is what I would change at production scale:

| Component | Demo choice | Production choice |
|---|---|---|
| **Database** | SQLite (single file) | PostgreSQL with read replicas |
| **Campaign dispatch** | FastAPI BackgroundTasks | Celery + Redis / AWS SQS |
| **Receipt callbacks** | Direct HTTP | Message queue (SQS/Kafka) with retries + DLQ |
| **AI calls** | Synchronous in route handler | Async with timeout + fallback |
| **CORS** | `*` (all origins) | Allowlist of prod frontend URL |
| **Auth** | None | JWT/OAuth2 |

---

## ⚠️ Disclaimer

> This application and all data within it were created strictly as a technical assessment for the **XENO Engineering take-home assignment**. All customer names, orders, analytics, and campaigns are randomly generated seed data for demonstration purposes only. No real customer data was used. No offense or miscommunication is intended.

---

<div align="center">
  <p>Built with ❤️, FastAPI, React, and Gemini AI for the XENO Engineering Interview</p>
</div>
# CRM
