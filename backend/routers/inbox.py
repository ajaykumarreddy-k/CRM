"""
Inbox router — manages per-customer conversation threads.

The frontend expects a list of Contact objects, each with a messages array.
We use InboxMessage rows keyed by customer_id to build these threads.
Missing endpoints are:
  GET  /api/inbox                      → list[InboxContact]
  POST /api/inbox/{customer_id}/messages → send a message, returns InboxMessageItem
  PUT  /api/inbox/{customer_id}/read   → mark messages as read (unread count reset)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Customer, InboxMessage
from schemas import InboxContact, InboxMessageItem, OkResponse
from datetime import datetime

router = APIRouter(tags=["Inbox"])

AVATARS = [
    "https://i.pravatar.cc/100?img=1",
    "https://i.pravatar.cc/100?img=5",
    "https://i.pravatar.cc/100?img=10",
    "https://i.pravatar.cc/100?img=14",
    "https://i.pravatar.cc/100?img=20",
    "https://i.pravatar.cc/100?img=25",
    "https://i.pravatar.cc/100?img=30",
    "https://i.pravatar.cc/100?img=35",
]


def _format_time(dt: datetime) -> str:
    now = datetime.utcnow()
    diff = (now - dt).total_seconds()
    if diff < 60:
        return "Just now"
    if diff < 3600:
        return f"{int(diff // 60)}m ago"
    if diff < 86400:
        return f"{int(diff // 3600)}h ago"
    return dt.strftime("%b %d")


def _build_contact(customer: Customer, messages: list[InboxMessage], idx: int) -> InboxContact:
    msg_items = [
        InboxMessageItem(
            id=m.id,
            sender="user" if m.direction == "outbound" else "contact",
            text=m.content,
            timestamp=_format_time(m.created_at),
        )
        for m in sorted(messages, key=lambda x: x.created_at)
    ]
    # Count inbound (from contact) unread messages — treat all inbound as potentially unread
    unread = sum(1 for m in messages if m.direction == "inbound")

    return InboxContact(
        id=customer.id,
        name=customer.name,
        avatar=AVATARS[idx % len(AVATARS)],
        email=customer.email or "",
        status="online" if idx % 3 == 0 else "offline",
        lastActive=_format_time(messages[-1].created_at) if messages else "Never",
        unreadCount=unread,
        channel=customer.channel_pref or "Email",
        messages=msg_items,
    )


@router.get("/inbox", response_model=list[InboxContact])
def get_inbox(db: Session = Depends(get_db)):
    """
    Return all customers who have inbox messages, as Contact objects with thread.
    Limit to 30 most active contacts.
    """
    # Get customers that have inbox messages
    customers_with_msgs = (
        db.query(Customer)
        .join(InboxMessage, InboxMessage.customer_id == Customer.id)
        .distinct()
        .order_by(Customer.created_at.desc())
        .limit(30)
        .all()
    )

    # Fallback: if no messages yet, return first 10 customers with empty threads
    if not customers_with_msgs:
        customers_with_msgs = db.query(Customer).limit(10).all()

    result = []
    for idx, customer in enumerate(customers_with_msgs):
        messages = (
            db.query(InboxMessage)
            .filter(InboxMessage.customer_id == customer.id)
            .order_by(InboxMessage.created_at.asc())
            .all()
        )
        result.append(_build_contact(customer, messages, idx))

    return result


@router.post("/inbox/{customer_id}/messages", response_model=InboxMessageItem)
def send_message(
    customer_id: str,
    body: dict,
    db: Session = Depends(get_db),
):
    """Send (or simulate receiving) a message in a customer thread."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    text = body.get("text", "")
    sender = body.get("sender", "user")  # "user" = outbound, "contact" = inbound
    direction = "outbound" if sender == "user" else "inbound"

    msg = InboxMessage(
        customer_id=customer_id,
        channel=customer.channel_pref or "Email",
        content=text,
        direction=direction,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return InboxMessageItem(
        id=msg.id,
        sender=sender,
        text=msg.content,
        timestamp=_format_time(msg.created_at),
    )


@router.put("/inbox/{customer_id}/read", response_model=OkResponse)
def mark_read(customer_id: str, db: Session = Depends(get_db)):
    """Mark all inbound messages for a customer as read (set direction to 'read')."""
    db.query(InboxMessage).filter(
        InboxMessage.customer_id == customer_id,
        InboxMessage.direction == "inbound",
    ).update({"direction": "read"})
    db.commit()
    return OkResponse()
