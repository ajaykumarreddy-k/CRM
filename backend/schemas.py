"""
Pydantic request / response schemas for XENO CRM.
Keeping schemas separate from ORM models keeps the API surface clean.
"""
from pydantic import BaseModel, Field, computed_field, model_validator
from typing import Any, List, Optional
from datetime import datetime


# ── Shared ────────────────────────────────────────────────────────────────────

class OkResponse(BaseModel):
    ok: bool = True


# ── Customers ─────────────────────────────────────────────────────────────────

class CustomerOut(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    channel_pref: str
    total_spend: float
    order_count: int
    last_order_date: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[misc]
    @property
    def channel(self) -> str:
        """Alias the frontend expects instead of channel_pref."""
        return self.channel_pref


class CustomerListOut(BaseModel):
    customers: List[CustomerOut]
    total: int


# ── Segments ──────────────────────────────────────────────────────────────────

class SegmentCreate(BaseModel):
    name: str
    rules: dict


class SegmentOut(BaseModel):
    id: str
    name: str
    rules: dict
    customer_count: int
    created_at: datetime

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[misc]
    @property
    def count(self) -> int:
        """Alias the frontend uses instead of customer_count."""
        return self.customer_count

    @computed_field  # type: ignore[misc]
    @property
    def createdAt(self) -> str:
        """ISO string alias the frontend uses instead of created_at."""
        return self.created_at.isoformat() if self.created_at else ""


class PreviewRequest(BaseModel):
    rules: dict


class PreviewOut(BaseModel):
    count: int
    sample: List[CustomerOut]


# ── Campaigns ─────────────────────────────────────────────────────────────────

class CampaignCreate(BaseModel):
    name: str
    segment_id: str
    channel: str
    message_template: str


class CampaignOut(BaseModel):
    id: str
    name: str
    channel: str
    status: str
    created_at: datetime
    segment_name: Optional[str] = None

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[misc]
    @property
    def segment(self) -> str:
        """Alias the stats page uses for the segment name."""
        return self.segment_name or "—"


class CampaignStatsOut(BaseModel):
    total: int
    queued: int
    sent: int
    delivered: int
    opened: int
    read: int
    clicked: int
    converted: int
    failed: int
    pct_delivered: float
    pct_opened: float
    pct_clicked: float
    pct_converted: float
    # Nested breakdown the frontend Delivery Breakdown card expects
    statusBreakdown: dict = {}


# ── Receipts ──────────────────────────────────────────────────────────────────

class ReceiptIn(BaseModel):
    communication_id: str
    event_type: str
    timestamp: Optional[str] = None


# ── Products ──────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    stock_quantity: int = 0
    description: Optional[str] = ""


class ProductOut(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    price: float
    stock_quantity: int
    description: Optional[str] = None
    revenue: float = 0.0     # not yet tracked per product; default 0
    sales: int = 0           # not yet tracked per product; default 0

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[misc]
    @property
    def stock(self) -> int:
        """Alias the frontend uses instead of stock_quantity."""
        return self.stock_quantity


class ProductStatsOut(BaseModel):
    total_stock_value: float
    catalog_items: int
    out_of_stock: int


class ProductListOut(BaseModel):
    products: List[ProductOut]
    stats: ProductStatsOut


# ── Projects ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    client_name: str = Field(alias="clientName")
    client_avatar: str = Field(default="", alias="clientAvatar")
    client_email: str = Field(default="", alias="clientEmail")
    project_name: str = Field(alias="projectName")
    project_desc: str = Field(default="", alias="projectDesc")
    due_date: str = Field(default="", alias="dueDate")
    contract_value: float = Field(default=0.0, alias="contractValue")
    status: str = "Draft"
    has_note: bool = Field(default=False, alias="hasNote")
    notes: str = ""

    model_config = {"populate_by_name": True}


class ProjectOut(BaseModel):
    id: str
    client_name: str = Field(serialization_alias="clientName")
    client_avatar: str = Field(serialization_alias="clientAvatar")
    client_email: str = Field(serialization_alias="clientEmail")
    project_name: str = Field(serialization_alias="projectName")
    project_desc: str = Field(serialization_alias="projectDesc")
    due_date: str = Field(serialization_alias="dueDate")
    contract_value: float = Field(serialization_alias="contractValue")
    status: str
    has_note: bool = Field(serialization_alias="hasNote")
    notes: str

    model_config = {"from_attributes": True, "populate_by_name": True}


# ── Dashboard ─────────────────────────────────────────────────────────────────

class ActivityItem(BaseModel):
    communication_id: str
    event_type: str
    received_at: str


class DashboardMetrics(BaseModel):
    customers: int
    campaigns: int
    sent: int
    cvr: float
    # Extra fields the frontend uses (optional, provide sensible defaults)
    clients: Optional[int] = None
    clientsComparison: Optional[str] = None
    clientsSubtitle: Optional[str] = None
    revenue: Optional[float] = None
    revenueComparison: Optional[str] = None
    revenueSubtitle: Optional[str] = None
    projects: Optional[int] = None
    projectsComparison: Optional[str] = None
    projectsSubtitle: Optional[str] = None


class DashboardOut(BaseModel):
    metrics: DashboardMetrics
    recent_campaigns: List[CampaignOut]
    activity_feed: List[ActivityItem]


# ── Inbox ─────────────────────────────────────────────────────────────────────

class InboxMessageItem(BaseModel):
    id: str
    sender: str   # "user" | "contact"
    text: str
    timestamp: str


class InboxContact(BaseModel):
    id: str
    name: str
    avatar: str
    email: str
    status: str   # "online" | "offline"
    lastActive: str
    unreadCount: int
    channel: str
    messages: List[InboxMessageItem]


# ── AI ────────────────────────────────────────────────────────────────────────

class SegmentAIReq(BaseModel):
    prompt: str


class DraftAIReq(BaseModel):
    goal: str
    # Frontend sends either "segment_name" or "segment" — accept both
    segment_name: str = ""
    segment: str = ""
    channel: str = "email"

    @property
    def resolved_segment(self) -> str:
        return self.segment_name or self.segment or "all customers"


class InsightAIReq(BaseModel):
    stats: dict


class InboxDraftAIReq(BaseModel):
    conversationHistory: List[dict] = []
    contactName: str = ""


class ChatMsg(BaseModel):
    role: str
    content: str


class ChatAIReq(BaseModel):
    message: str
    history: List[ChatMsg] = []
