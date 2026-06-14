"""
XENO Mini CRM — FastAPI application entry point.
Run: uv run crm   (or)  uvicorn main:app --port 8000 --reload
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import customers, segments, campaigns, receipts, ai, dashboard, products, inbox, projects

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="XENO Mini CRM",
    description="Customer Relationship Management API with AI-powered segmentation and campaign tools.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(dashboard.router,  prefix="/api")
app.include_router(customers.router,  prefix="/api")
app.include_router(segments.router,   prefix="/api")
app.include_router(campaigns.router,  prefix="/api")
app.include_router(receipts.router,   prefix="/api")
app.include_router(ai.router,         prefix="/api")
app.include_router(products.router,   prefix="/api")
app.include_router(inbox.router,      prefix="/api")
app.include_router(projects.router,   prefix="/api")


@app.get("/")
def health():
    return {"status": "ok", "service": "XENO Mini CRM"}
