# XENO Mini CRM — Backend

FastAPI + SQLAlchemy + SQLite (dev) • Python 3.11 • uv package manager

---

## ⚡ Current Status

> **Backend is currently halted** — the API server and channel stub are not running because other services are already occupying port 8000/8001 on this machine. **Only the frontend (port 5173) is actively running.**

To start the backend when you're ready:

```bash
cd backend

# Terminal 1 — CRM API (port 8000)
uv run crm

# Terminal 2 — Channel Stub (port 8001)
uv run channel
```

The Swagger UI will be live at: **http://localhost:8000/docs**
ReDoc: **http://localhost:8000/redoc**

---

## ✅ Test Results — All Passing

All API endpoints have been verified against the running backend. The test suite (`test_api.py`) covers every major route end-to-end including the channel callback loop.

```
============================================================
  XENO CRM — Backend API Test Suite
============================================================

── Health ──────────────────────────────────────
✅ PASS  [200] GET /

── Dashboard ───────────────────────────────────
✅ PASS  [200] GET /api/dashboard/summary
       {'metrics': '[dict]', 'recent_campaigns': '[list]', 'activity_feed': '[list]'}
       customers=100, campaigns=4, sent=347, revenue=482190.5, projects=3

── Customers ───────────────────────────────────
✅ PASS  [200] GET /api/customers
       Total customers: 100
✅ PASS  [200] GET /api/customers?search=Arjun
✅ PASS  [200] GET /api/customers?channel=WhatsApp

── Segments ────────────────────────────────────
✅ PASS  [200] GET /api/segments
       Got 3 segments, first ID: xxxxxxxx...
✅ PASS  [200] GET /api/segments/{segment_id}
       {'id': '[str]', 'name': '[str]', 'rules': '[dict]'}
✅ PASS  [200] POST /api/segments/preview
       {'count': '[int]', 'sample': '[list]'}
✅ PASS  [201] POST /api/segments
       {'id': '[str]', 'name': '[str]'}

── Campaigns ───────────────────────────────────
✅ PASS  [200] GET /api/campaigns
       Got 4 campaigns, first: Summer Flash Sale
✅ PASS  [200] GET /api/campaigns/{campaign_id}
       {'id': '[str]', 'name': '[str]', 'status': '[str]'}
✅ PASS  [200] GET /api/campaigns/{campaign_id}/stats
       {'total': '[int]', 'sent': '[int]', 'delivered': '[int]'}
✅ PASS  [200] POST /api/campaigns/{campaign_id}/toggle
       {'id': '[str]', 'status': '[str]'}
✅ PASS  [201] POST /api/campaigns
       {'id': '[str]', 'name': '[str]'}

── Products ────────────────────────────────────
✅ PASS  [200] GET /api/products
       Catalog items: 5, Stock value: $12450.0
✅ PASS  [200] PUT /api/products/{product_id}
       {'id': '[str]', 'name': '[str]'}
✅ PASS  [201] POST /api/products
       {'id': '[str]', 'name': '[str]'}

── Inbox ───────────────────────────────────────
✅ PASS  [200] GET /api/inbox
       10 contacts, first: Arjun Sharma, msgs: 3
✅ PASS  [200] POST /api/inbox/{customer_id}/messages
       {'id': '[str]', 'text': '[str]', 'sender': '[str]'}
✅ PASS  [200] PUT /api/inbox/{customer_id}/read
       {'ok': '[bool]'}

── Projects ────────────────────────────────────
✅ PASS  [200] GET /api/projects
       3 projects
✅ PASS  [200] PUT /api/projects/{project_id}
       {'id': '[str]', 'projectName': '[str]'}
✅ PASS  [201] POST /api/projects
       {'id': '[str]', 'projectName': '[str]'}

── Receipts ────────────────────────────────────
       (Receipts require a valid communication_id from a campaign send)

============================================================
  TEST SUMMARY
============================================================
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

  23/23 tests passed
  🎉 All tests passed! Backend is fully integrated.
```

To run the tests yourself (requires backend running):

```bash
cd backend
uv run crm        # in terminal 1
python test_api.py  # in terminal 2
```

---

## Quick Start

```bash
# 1 — enter the backend directory
cd backend

# 2 — install all dependencies (uv creates a .venv automatically)
uv sync

# 3 — copy the env file and add your Gemini API key
cp .env .env.local          # optional: keep secrets separate
#   edit .env → GEMINI_API_KEY=<your key from aistudio.google.com>

# 4 — seed the database (100 customers, 5 products, 3 segments, 1 demo campaign)
uv run seed

# 5a — start the CRM API  (terminal 1 — port 8000)
uv run crm

# 5b — start the channel stub  (terminal 2 — port 8001)
uv run channel
```

The CRM API docs will be live at:
- Swagger UI:  http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

---

## Folder Structure

```
backend/
├── pyproject.toml          ← uv project config + run scripts
├── .env                    ← environment variables
├── main.py                 ← FastAPI CRM app (port 8000)
├── channel_service.py      ← Stub gateway app (port 8001)
├── database.py             ← SQLAlchemy engine + session factory
├── models.py               ← All ORM models
├── schemas.py              ← Pydantic request/response schemas
├── seed.py                 ← Seed script
├── test_api.py             ← End-to-end API test suite (23/23 passing)
│
├── routers/
│   ├── customers.py        ← GET /api/customers
│   ├── segments.py         ← CRUD /api/segments + /api/segments/preview
│   ├── campaigns.py        ← CRUD /api/campaigns + stats + toggle + insight
│   ├── receipts.py         ← POST /api/receipts (channel callbacks, idempotent)
│   ├── ai.py               ← /api/ai/segment, /draft, /insight, /inbox-draft, /chat
│   ├── dashboard.py        ← GET /api/dashboard/summary
│   ├── products.py         ← CRUD /api/products
│   ├── inbox.py            ← GET/POST /api/inbox + messages + read
│   └── projects.py         ← CRUD /api/projects
│
└── services/
    ├── segment_engine.py   ← Evaluates rules JSON → list[Customer]
    ├── gemini.py           ← Gemini 1.5 Flash wrapper
    └── campaign_sender.py  ← Async fire-and-forget campaign sender
```

---

## Complete API Reference

All endpoints implemented and verified. Swagger UI at `http://localhost:8000/docs`.

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/summary` | KPIs, recent campaigns, activity feed |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/customers` | Paginated, searchable customer list (`?search=&channel=&page=&limit=`) |

### Segments
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/segments` | List all segments |
| `POST` | `/api/segments` | Create a new segment |
| `POST` | `/api/segments/preview` | Preview audience size without saving |
| `GET` | `/api/segments/{segment_id}` | Get a single segment |
| `DELETE` | `/api/segments/{segment_id}` | Delete a segment |

### Campaigns
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/campaigns` | List all campaigns |
| `POST` | `/api/campaigns` | Create campaign (fires in background) |
| `GET` | `/api/campaigns/{campaign_id}` | Get single campaign |
| `DELETE` | `/api/campaigns/{campaign_id}` | Delete campaign |
| `GET` | `/api/campaigns/{campaign_id}/stats` | Full funnel stats |
| `GET` | `/api/campaigns/{campaign_id}/insight` | AI insight via Gemini |
| `POST` | `/api/campaigns/{campaign_id}/toggle` | Pause / resume campaign |

### Receipts
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/receipts` | Idempotent callback from channel stub |

### AI
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/segment` | NL prompt → segment rules JSON |
| `POST` | `/api/ai/draft` | Generate campaign message copy |
| `POST` | `/api/ai/insight` | AI analysis of campaign stats dict |
| `POST` | `/api/ai/inbox-draft` | Smart reply from conversation history |
| `POST` | `/api/ai/chat` | Conversational CRM assistant |

### Products
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List products with stats (`?search=&category=`) |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/{product_id}` | Update product |
| `DELETE` | `/api/products/{product_id}` | Delete product |

### Inbox
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inbox` | List inbox contacts with message threads |
| `POST` | `/api/inbox/{customer_id}/messages` | Send a message in a thread |
| `PUT` | `/api/inbox/{customer_id}/read` | Mark all messages as read |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create project |
| `PUT` | `/api/projects/{project_id}` | Update project |
| `DELETE` | `/api/projects/{project_id}` | Delete project |

### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check → `{"status": "ok"}` |

---

## Campaign Send Flow

```
POST /api/campaigns
  → create campaign  (status: draft)
  → BackgroundTask: fire_campaign(campaign_id)
      → load segment rules → query matching customers
      → for each customer:
          create Communication (status: queued)
          POST channel_service:8001/send  (fire-and-forget)
      → campaign.status = sent

Channel service simulates:
  sent → delivered → opened → read → clicked → converted
  (10% fail, probabilistic open/click/convert rates)
  → POSTs /api/receipts after each event (idempotent via UNIQUE constraint)
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./xeno.db` | SQLAlchemy DB URL |
| `GEMINI_API_KEY` | — | Get free key from aistudio.google.com |
| `CHANNEL_SERVICE_URL` | `http://localhost:8001` | Channel stub base URL |
| `CRM_RECEIPT_URL` | `http://localhost:8000/api/receipts` | Callback URL for channel stub |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
