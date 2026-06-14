from sqlalchemy import (
    Column, String, Float, Integer, DateTime, JSON,
    ForeignKey, UniqueConstraint, Text,
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid


def gen_id() -> str:
    return str(uuid.uuid4())


# ── Customers ─────────────────────────────────────────────────────────────────

class Customer(Base):
    __tablename__ = "customers"

    id             = Column(String, primary_key=True, default=gen_id)
    name           = Column(String, nullable=False)
    email          = Column(String, unique=True)
    phone          = Column(String)
    channel_pref   = Column(String, default="Email")   # WhatsApp|SMS|Email|RCS
    total_spend    = Column(Float, default=0.0)
    order_count    = Column(Integer, default=0)
    last_order_date = Column(DateTime, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)

    orders          = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    communications  = relationship("Communication", back_populates="customer")
    inbox_messages  = relationship("InboxMessage", back_populates="customer", cascade="all, delete-orphan")


# ── Orders ────────────────────────────────────────────────────────────────────

class Order(Base):
    __tablename__ = "orders"

    id          = Column(String, primary_key=True, default=gen_id)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"))
    amount      = Column(Float, nullable=False)
    items       = Column(JSON, default=list)
    ordered_at  = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")


# ── Products ──────────────────────────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id             = Column(String, primary_key=True, default=gen_id)
    name           = Column(String, nullable=False)
    category       = Column(String)
    price          = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=0)
    description    = Column(Text, default="")
    created_at     = Column(DateTime, default=datetime.utcnow)


# ── Segments ──────────────────────────────────────────────────────────────────

class Segment(Base):
    __tablename__ = "segments"

    id             = Column(String, primary_key=True, default=gen_id)
    name           = Column(String, nullable=False)
    rules          = Column(JSON, nullable=False)
    customer_count = Column(Integer, default=0)
    created_at     = Column(DateTime, default=datetime.utcnow)

    campaigns = relationship("Campaign", back_populates="segment")


# ── Campaigns ─────────────────────────────────────────────────────────────────

class Campaign(Base):
    __tablename__ = "campaigns"

    id               = Column(String, primary_key=True, default=gen_id)
    name             = Column(String, nullable=False)
    segment_id       = Column(String, ForeignKey("segments.id"), nullable=True)
    channel          = Column(String, nullable=False)
    message_template = Column(Text, nullable=False)
    status           = Column(String, default="draft")  # draft|sending|sent|paused
    created_at       = Column(DateTime, default=datetime.utcnow)

    segment        = relationship("Segment", back_populates="campaigns")
    communications = relationship("Communication", back_populates="campaign", cascade="all, delete-orphan")


# ── Communications ────────────────────────────────────────────────────────────

class Communication(Base):
    __tablename__ = "communications"

    id          = Column(String, primary_key=True, default=gen_id)
    campaign_id = Column(String, ForeignKey("campaigns.id", ondelete="CASCADE"))
    customer_id = Column(String, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    channel     = Column(String)
    message     = Column(Text)
    status      = Column(String, default="queued")  # queued|sent|delivered|opened|read|clicked|converted|failed
    created_at  = Column(DateTime, default=datetime.utcnow)

    campaign  = relationship("Campaign", back_populates="communications")
    customer  = relationship("Customer", back_populates="communications")
    receipts  = relationship("Receipt", back_populates="communication", cascade="all, delete-orphan")


# ── Receipts ──────────────────────────────────────────────────────────────────

class Receipt(Base):
    __tablename__ = "receipts"

    id               = Column(String, primary_key=True, default=gen_id)
    communication_id = Column(String, ForeignKey("communications.id", ondelete="CASCADE"))
    event_type       = Column(String)   # sent|delivered|opened|read|clicked|converted|failed
    received_at      = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("communication_id", "event_type", name="uq_comm_event"),
    )

    communication = relationship("Communication", back_populates="receipts")


# ── InboxMessages ─────────────────────────────────────────────────────────────

class InboxMessage(Base):
    __tablename__ = "inbox_messages"

    id          = Column(String, primary_key=True, default=gen_id)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="CASCADE"))
    channel     = Column(String)
    content     = Column(Text)
    direction   = Column(String, default="outbound")  # inbound|outbound
    created_at  = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="inbox_messages")


# ── Projects ──────────────────────────────────────────────────────────────────

class Project(Base):
    __tablename__ = "projects"

    id             = Column(String, primary_key=True, default=gen_id)
    client_name    = Column(String, nullable=False)
    client_avatar  = Column(String, default="")
    client_email   = Column(String, default="")
    project_name   = Column(String, nullable=False)
    project_desc   = Column(String, default="")
    due_date       = Column(String, default="")
    contract_value = Column(Float, default=0.0)
    status         = Column(String, default="Draft")  # Draft|In Progress|On Review|Completed|Canceled|Recommended
    has_note       = Column(Integer, default=0)  # 0=False, 1=True
    notes          = Column(Text, default="")
    created_at     = Column(DateTime, default=datetime.utcnow)

