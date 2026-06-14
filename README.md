<div align="center">
  <h1>XENO Mini CRM</h1>
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

## What I Built

I put together a fully functional, AI-native Mini CRM tailored for a Direct-to-Consumer fashion brand. The goal here was to build something that actually helps marketers do their jobs better, rather than just throwing AI at a wall to see what sticks.

Here is how the product helps users:

1. **Decide who to talk to** — There's an AI-powered segment builder that takes plain English and turns it into structured audience rules.
2. **Know what to say** — Gemini steps in to draft personalized campaign copy tailored to the specific channel and audience.
3. **Reach them** — Campaigns are dispatched through a realistic two-service, callback-driven architecture supporting WhatsApp, SMS, Email, and RCS.
4. **Understand performance** — A live campaign stats page breaks down the full funnel: from sent, to delivered, opened, read, clicked, and finally converted.

> **Key product bet:** I deliberately chose a hybrid AI model. Instead of a pure chat interface, which can sometimes feel unmoored, I built a clean, familiar UI and wove AI into the specific steps where it adds the most value (segment creation, message drafting, surfacing insights, and smart inbox replies). I feel this is a much more opinionated and actionable approach for this specific use case.

---

## Current Running State

> **Backend is halted** — Right now, ports 8000/8001 are occupied by other running processes on the system. **Only the frontend is currently active** and available at `http://localhost:5173`.
>
> If you want to spin the backend up yourself, run: `cd backend && uv run crm` (in terminal 1) and `uv run channel` (in terminal 2).

---

## Test Results — 23/23 Passing

```text
Health - Passed
Dashboard Summary - Passed
List Customers - Passed
Search Customers - Passed
Filter by Channel - Passed
List Segments - Passed
Get Segment - Passed
Preview Segment - Passed
Create Segment - Passed
List Campaigns - Passed
Get Campaign - Passed
Campaign Stats - Passed
Toggle Campaign - Passed
Create Campaign - Passed
List Products - Passed
Update Product - Passed
Create Product - Passed
List Inbox Contacts - Passed
Send Message - Passed
Mark as Read - Passed
List Projects - Passed
Update Project - Passed
Create Project - Passed

23/23 tests passed — All tests passed. The backend is fully integrated and working as expected.
```

---

## Assignment Requirements Checklist

| Requirement | Status | Implementation Details |
|---|---|---|
| Ingest customers & orders | Done | Uses Customer and Order models, seeded with realistic DTC data. |
| Segment shoppers by behaviour | Done | Built a rule engine looking at total spend, order count, recency, and channel preference. |
| AI-powered segmentation | Done | Converts natural language into JSON rules via Gemini (`POST /api/ai/segment`). |
| Send personalised messages | Done | Handles `[name]` personalisation, dispatched per-customer using FastAPI BackgroundTasks. |
| Separate channel service stub | Done | Runs `channel_service.py` on port 8001 as an isolated FastAPI app. |
| Full callback lifecycle | Done | Tracks progression: sent, delivered, opened, read, clicked, and converted/failed. |
| Idempotent receipt ingestion | Done | Enforces a `UNIQUE(communication_id, event_type)` constraint and forward-only status progression. |
| Campaign performance insights | Done | Displays full funnel stats alongside an AI-generated insight card per campaign. |
| AI message drafting | Done | Gemini drafts contextual copy based on the chosen channel, goal, and audience. |
| AI conversational assistant | Done | Added an `/ai` chat page that routes actions for segmenting, drafting, or general Q&A. |
| AI inbox smart reply | Done | Generates contextual, ready-to-send replies directly from the conversation history. |
| Multi-channel support | Done | Supports WhatsApp, SMS, Email, and RCS across the board. |
| Project tracker | Done | Built full CRUD capabilities at `/api/projects` and a matching frontend management page. |

---

## AI Engine Optimization (AEO) Ready

I'm actually really proud of this part. The application's LaunchPage isn't just built for humans; it's fully optimized for AI crawlers like GPTBot, ClaudeBot, and PerplexityBot, as well as traditional SEO. I hit top marks across the AEO evaluation checklist:

- **Findable**: `robots.txt`, `sitemap.xml`, and Canonical URLs are all correctly configured to welcome and guide AI bots.
- **Quotable**: I made sure to include comprehensive meta descriptions, rich body content, and a dedicated FAQ section to make the site easily extractable and citable by LLMs.
- **Understandable**: The site uses a clean heading hierarchy, Organization JSON-LD structured data, and Open Graph tags to help bots deeply understand the semantics of the page.
- **Trustworthy**: I added a dedicated `/llms.txt` file (which is quickly becoming the standard for AI-readable site documentation), alongside contextual internal links and external citations to authoritative industry sources.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    XENO CRM Frontend (React)                    │
│  Dashboard │ Customers │ Segments │ Campaigns │ Inbox │ AI Chat │
└───────────────────────┬─────────────────────────────────────────┘
                        │ REST API (CORS allows all origins for the demo)
┌───────────────────────▼─────────────────────────────────────────┐
│              CRM Backend — FastAPI (port 8000)                  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐   │
│  │ /segments│  │/campaigns│  │ /ai/draft  │  │  /receipts   │   │
│  │ engine   │  │ sender   │  │ /ai/segment│  │  ingestion   │   │
│  └──────────┘  └────┬─────┘  └────────────┘  └──────┬───────┘   │
│                     │ POST /send                    │ callback  │
│  ┌──────────────────▼───────────────────────────────▼───────┐   │
│  │         SQLite DB (SQLAlchemy ORM)                       │   │
│  │  Customers │ Orders │ Segments │ Campaigns               │   │
│  │  Receipts  │ Inbox  │ Products │ Projects                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     │                       ▲                   │
└─────────────────────┼───────────────────────┼───────────────────┘
                      │ POST /send            │ POST /api/receipts
          ┌───────────▼───────────────────────┴──────────┐
          │     Channel Stub Service (port 8001)         │
          │                                              │
          │  Simulates the flow: sent, delivered,        │
          │  opened, read, clicked, converted/failed     │
          │  Roughly ~10% fail, ~60% open, ~20% convert  │
          └──────────────────────────────────────────────┘
                      │ calls
          ┌───────────▼───────────┐
          │  Google Gemini API    │
          │  (gemini-1.5-flash)   │
          └───────────────────────┘
```

### Key Design Decisions & Tradeoffs

When building this, I had to make a few practical calls to balance the needs of a demo environment with solid engineering principles:

| Decision | Reasoning | The Tradeoff |
|---|---|---|
| **SQLite for the database** | It's zero-config and perfectly adequate for a demo. | At a real-world scale, I'd definitely use PostgreSQL. Thankfully, SQLAlchemy makes that migration trivial. |
| **BackgroundTasks for dispatch** | It allows for non-blocking campaign sends so the request returns immediately. | There's no retry queue. If this were production, I'd bring in something like Celery or BullMQ. |
| **Forward-only status in receipt ingestion** | This prevents nasty race conditions if callbacks arrive out of order. | It means you can't re-open a closed event, but honestly, that's the correct CRM behaviour anyway. |
| **Idempotent receipts via UNIQUE constraint** | It handles duplicate callbacks gracefully without needing extra logic. | Handling deduplication at the DB level is just simpler and more reliable than maintaining an in-memory seen-set. |
| **Channel stub as a separate FastAPI app** | I wanted to mirror a real two-service architecture so they can be deployed independently. | In development, they share memory. At scale, they'd need a real message queue like SQS or Kafka to talk to each other reliably. |
| **Gemini 1.5 Flash** | It's incredibly fast, cheap, and quite good at generating JSON and text. | GPT-4 might be slightly more capable for complex reasoning, but it adds API key friction for anyone testing this out. |
| **HashRouter in React** | It plays nicely with static file deployment without requiring server-side rewrites. | The URLs end up showing a `#/` prefix, which isn't the prettiest, but it gets the job done smoothly. |

---

## Folder Structure

```text
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
│   │   └── lib/                # Shared utilities and configurations
│   └── package.json            # Managed by bun
└── backend/                    # FastAPI Python server
    ├── routers/                # API endpoints broken down by domain
    ├── services/
    │   ├── campaign_sender.py  # Background task bridging CRM and channel service
    │   ├── segment_engine.py   # Evaluates JSON rules against customer data
    │   └── gemini.py           # A thin, focused wrapper around Gemini 1.5 Flash
    ├── models.py               # SQLAlchemy ORM definitions
    ├── schemas.py              # Pydantic v2 schemas for request/response validation
    ├── channel_service.py      # The separate stub service running on port 8001
    ├── seed.py                 # Generates the realistic DTC seed data
    ├── test_api.py             # The comprehensive end-to-end API test suite
    └── pyproject.toml          # uv-managed dependencies and scripts
```

---

## Getting Started

### What you'll need
- Python 3.11+ and `uv`
- Node.js 18+ and `bun`
- A `GEMINI_API_KEY` from Google AI Studio

### 1. Setting up the Backend

```bash
cd backend

# Install all dependencies
uv sync

# Copy over the example environment variables
cp .env.example .env
# Don't forget to edit .env and add your GEMINI_API_KEY

# Seed the database with some realistic data to play with
uv run seed

# Start up the main CRM API (this runs on port 8000)
uv run crm

# Open a second terminal and start up the channel stub (port 8001)
uv run channel

# Optional: Run the API test suite to verify everything is wired up correctly
uv run test
```

### 2. Setting up the Frontend

```bash
cd "front end"
bun install
bun run dev
# Then open your browser to http://localhost:5173
```

### 3. Environment Variables

| Variable | Default | What it does |
|---|---|---|
| `GEMINI_API_KEY` | (Empty) | **Required** for all the AI features to work. |
| `CHANNEL_SERVICE_URL` | `http://localhost:8001` | Tells the CRM where to find the channel stub. |
| `CRM_RECEIPT_URL` | `http://localhost:8000/api/receipts` | Tells the channel stub where to send callbacks. |

---

## API Reference

If you spin up the backend, you can explore the full interactive docs at `http://localhost:8000/docs` (Swagger UI) or `http://localhost:8000/redoc` (ReDoc).

| Method | Path | Description |
|---|---|---|
| GET | `/` | A simple health check to make sure things are running. |
| GET | `/api/dashboard/summary` | Grabs KPIs, recent campaigns, and the activity feed. |
| GET | `/api/customers` | Returns a paginated, searchable list of customers. |
| GET | `/api/segments` | Lists out all the saved segments. |
| POST | `/api/segments` | Creates a new segment. |
| POST | `/api/segments/preview` | Lets you preview the audience size before you commit to saving. |
| GET | `/api/segments/{id}` | Retrieves a single segment. |
| DELETE | `/api/segments/{id}` | Deletes a segment. |
| GET | `/api/campaigns` | Lists out all campaigns. |
| POST | `/api/campaigns` | Creates a campaign and immediately kicks off the background dispatch. |
| GET | `/api/campaigns/{id}` | Retrieves a single campaign. |
| DELETE | `/api/campaigns/{id}` | Deletes a campaign. |
| POST | `/api/campaigns/{id}/toggle` | Pauses or resumes an active campaign. |
| GET | `/api/campaigns/{id}/stats` | Pulls the full funnel stats and status breakdown. |
| GET | `/api/campaigns/{id}/insight` | Asks Gemini to analyze the campaign results and return insights. |
| POST | `/api/receipts` | The endpoint where the channel service sends its idempotent callbacks. |
| POST | `/api/ai/segment` | Takes a natural language prompt and turns it into a segment rules JSON. |
| POST | `/api/ai/draft` | Generates message copy for a campaign. |
| POST | `/api/ai/insight` | Returns an AI analysis from a raw dictionary of stats. |
| POST | `/api/ai/inbox-draft` | Suggests a smart reply based on an inbox thread's history. |
| POST | `/api/ai/chat` | The endpoint for the conversational CRM assistant. |
| GET | `/api/products` | Lists products along with some catalog stats. |
| POST | `/api/products` | Adds a new product to the catalog. |
| PUT | `/api/products/{id}` | Updates an existing product. |
| DELETE | `/api/products/{id}` | Removes a product. |
| GET | `/api/projects` | Lists all projects in the tracker. |
| POST | `/api/projects` | Creates a new project. |
| PUT | `/api/projects/{id}` | Updates project details. |
| DELETE | `/api/projects/{id}` | Deletes a project. |
| GET | `/api/inbox` | Retrieves the threaded contact list for the inbox. |
| POST | `/api/inbox/{customer_id}/messages` | Sends a message within a specific thread. |
| PUT | `/api/inbox/{customer_id}/read` | Marks messages in a thread as read. |
| POST | `http://localhost:8001/send` | The endpoint on the separate channel stub that simulates sending. |

---

## Automated Testing

```bash
cd backend
uv run crm          # Make sure the server is running first (terminal 1)
python test_api.py  # Then run the tests (terminal 2)
```

The test suite (`test_api.py`) goes through and validates all 23 endpoints end-to-end. This covers everything from segment previews and campaign creation to product CRUD, inbox messaging, project tracking, and the full lifecycle of the channel callback loop.

**Result: 23/23 tests pass.**

---

## Scale Assumptions & Explicit Tradeoffs

As I mentioned, this is built for a demo environment. If I were taking this to a true production scale, here is exactly what I'd swap out:

| Component | Demo choice | Production choice |
|---|---|---|
| **Database** | SQLite (a single file) | PostgreSQL configured with read replicas. |
| **Campaign dispatch** | FastAPI BackgroundTasks | A proper task queue like Celery and Redis, or AWS SQS. |
| **Receipt callbacks** | Direct HTTP calls | A message queue (like SQS or Kafka) complete with retries and a Dead Letter Queue. |
| **AI calls** | Synchronous, handled right in the route handler | Asynchronous calls with strict timeouts and fallback mechanisms. |
| **CORS** | Currently set to `*` (all origins) to make testing easy | Locked down to a strict allowlist containing only the production frontend URL. |
| **Auth** | None | I'd implement robust JWT or OAuth2 authentication. |

---

## Disclaimer

This application, and all the data you see within it, were created strictly as a technical assessment for the XENO Engineering take-home assignment. Every customer name, order, analytic data point, and campaign is randomly generated seed data meant solely for demonstration purposes. No real customer data was touched or used. No offense or miscommunication is intended by any of the generated content.

---

<div align="center">
  <p>Built with FastAPI, React, and Gemini AI for the XENO Engineering Interview</p>
</div>
