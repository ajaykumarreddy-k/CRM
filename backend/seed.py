"""
Seed script — populates the database with:
  - 5 products
  - 100 customers (realistic Indian names, random channels)
  - ~300 orders (1–5 per customer)
  - 3 segments (Active Buyers, Lapsed Customers, WhatsApp Fans)
  - 1 demo campaign with pre-seeded receipt events for analytics

Usage:  uv run seed   (or)  python seed.py
"""
import random
import uuid
from datetime import datetime, timedelta

from database import SessionLocal, engine, Base
from models import Customer, Order, Product, Segment, Campaign, Communication, Receipt, InboxMessage, Project
from services.segment_engine import get_customers_for_rules

# ── Create tables ─────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Static data ───────────────────────────────────────────────────────────────
FIRST_NAMES = [
    "Arjun", "Priya", "Ravi", "Sneha", "Kiran", "Anita", "Deepak", "Pooja",
    "Vijay", "Meera", "Arun", "Divya", "Sanjay", "Kavitha", "Ramesh",
    "Lakshmi", "Suresh", "Uma", "Ganesh", "Rekha", "Amit", "Sunita", "Raj",
    "Nisha", "Praveen", "Geeta", "Mohan", "Leela", "Harish", "Padma",
]
LAST_NAMES = [
    "Sharma", "Patel", "Kumar", "Reddy", "Singh", "Joshi", "Mehta", "Nair",
    "Iyer", "Gupta", "Pillai", "Krishnan", "Verma", "Rao", "Das", "Bhat",
    "Menon", "Tiwari", "Pandey", "Shah",
]
CHANNELS = ["WhatsApp", "SMS", "Email", "RCS"]

PRODUCTS_DATA = [
    ("Organic Cotton T-Shirt",     "Apparel",     24.99,  150),
    ("Premium Leather Jacket",     "Apparel",    199.99,   45),
    ("Ergonomic Office Chair",     "Furniture",  349.99,   12),
    ("Wireless Noise-Cancel Headphones", "Electronics", 89.99, 80),
    ("Natural Glow Face Serum",    "Beauty",      45.99,  200),
]


def gen_id() -> str:
    return str(uuid.uuid4())


def seed() -> None:
    db = SessionLocal()

    # ── Guard: already seeded? ────────────────────────────────────────────────
    if db.query(Customer).count() >= 50:
        print("⚠️  Database already seeded — skipping.")
        db.close()
        return

    # ── Products ──────────────────────────────────────────────────────────────
    print("🌱 Seeding products …")
    products = []
    for name, cat, price, stock in PRODUCTS_DATA:
        p = Product(id=gen_id(), name=name, category=cat, price=price, stock_quantity=stock)
        db.add(p)
        products.append(p)
    db.commit()

    # ── Customers ─────────────────────────────────────────────────────────────
    print("🌱 Seeding 100 customers …")
    customers = []
    used_emails: set[str] = set()

    for i in range(100):
        first = random.choice(FIRST_NAMES)
        last  = random.choice(LAST_NAMES)
        name  = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        # Ensure unique email
        while email in used_emails:
            email = f"{first.lower()}.{last.lower()}{i}_{random.randint(10,99)}@example.com"
        used_emails.add(email)

        channel = random.choice(CHANNELS)
        c = Customer(
            id=gen_id(),
            name=name,
            email=email,
            phone=f"+91{random.randint(7000000000, 9999999999)}",
            channel_pref=channel,
            total_spend=0.0,
            order_count=0,
        )
        db.add(c)
        customers.append(c)
    db.commit()

    # ── Orders ────────────────────────────────────────────────────────────────
    print("🌱 Seeding ~300 orders …")
    for c in customers:
        num_orders = random.randint(0, 5)
        for _ in range(num_orders):
            product  = random.choice(products)
            qty      = random.randint(1, 3)
            amount   = round(product.price * qty, 2)
            days_ago = random.randint(1, 180)
            ordered_at = datetime.utcnow() - timedelta(days=days_ago)

            order = Order(
                id=gen_id(),
                customer_id=c.id,
                amount=amount,
                items=[{"product_id": product.id, "name": product.name, "qty": qty}],
                ordered_at=ordered_at,
            )
            db.add(order)

            c.total_spend  = round((c.total_spend or 0.0) + amount, 2)
            c.order_count  = (c.order_count or 0) + 1
            if not c.last_order_date or ordered_at > c.last_order_date:
                c.last_order_date = ordered_at

    db.commit()

    # ── Segments ──────────────────────────────────────────────────────────────
    print("🌱 Seeding 3 segments …")
    segment_defs = [
        (
            "Active Buyers",
            {"operator": "AND", "rules": [
                {"field": "order_count",           "op": "gte", "value": 2},
                {"field": "days_since_last_order", "op": "lte", "value": 30},
            ]},
        ),
        (
            "Lapsed Customers",
            {"operator": "AND", "rules": [
                {"field": "days_since_last_order", "op": "gte", "value": 60},
            ]},
        ),
        (
            "WhatsApp Fans",
            {"operator": "AND", "rules": [
                {"field": "channel_pref", "op": "eq", "value": "WhatsApp"},
            ]},
        ),
    ]

    segments = []
    for name, rules in segment_defs:
        matched = get_customers_for_rules(db, rules)
        s = Segment(id=gen_id(), name=name, rules=rules, customer_count=len(matched))
        db.add(s)
        segments.append(s)
    db.commit()

    # ── Demo campaign with pre-seeded receipts ────────────────────────────────
    print("🌱 Seeding demo campaign with receipt analytics …")
    active_seg = segments[0]  # Active Buyers
    camp = Campaign(
        id=gen_id(),
        name="Spring Sale",
        segment_id=active_seg.id,
        channel="Email",
        message_template="Hey [name], our Spring Sale is LIVE! Grab 20% off everything. Shop now 🛍️",
        status="sent",
    )
    db.add(camp)
    db.commit()

    STATUS_FLOW = ["sent", "delivered", "opened", "read", "clicked"]
    seg_customers = get_customers_for_rules(db, active_seg.rules)[:20]

    for cust in seg_customers:
        # Pick a random stopping point in the funnel
        stop_at = random.randint(0, len(STATUS_FLOW) - 1)
        final_status = STATUS_FLOW[stop_at]

        comm = Communication(
            id=gen_id(),
            campaign_id=camp.id,
            customer_id=cust.id,
            channel="Email",
            message=f"Hey {cust.name}, our Spring Sale is LIVE! Grab 20% off everything.",
            status=final_status,
        )
        db.add(comm)
        db.commit()

        for event in STATUS_FLOW[: stop_at + 1]:
            try:
                r = Receipt(id=gen_id(), communication_id=comm.id, event_type=event)
                db.add(r)
                db.commit()
            except Exception:
                db.rollback()

        # ~20% of "clicked" also convert
        if final_status == "clicked" and random.random() < 0.20:
            try:
                comm.status = "converted"
                r = Receipt(id=gen_id(), communication_id=comm.id, event_type="converted")
                db.add(r)
                db.commit()
            except Exception:
                db.rollback()

    # ── Inbox Messages ────────────────────────────────────────────────────────
    print("🌱 Seeding inbox conversations …")
    INBOX_CONVOS = [
        [
            ("outbound", "Hi {name}, checking in on your recent order. Everything okay?"),
            ("inbound",  "Yes, arrived yesterday! Really happy with the quality."),
            ("outbound", "Glad to hear it! Let us know if you need anything."),
        ],
        [
            ("outbound", "Hey {name}, your exclusive offer expires tomorrow!"),
            ("inbound",  "Thanks for the heads up. Will check it out."),
        ],
        [
            ("outbound", "Hi {name}, just following up on our last conversation."),
            ("inbound",  "No worries, I'll get back to you by end of week."),
            ("outbound", "Perfect, we'll wait to hear from you!"),
            ("inbound",  "Sounds good. Talk soon."),
        ],
    ]
    for idx, cust in enumerate(customers[:15]):
        template = INBOX_CONVOS[idx % len(INBOX_CONVOS)]
        base_time = datetime.utcnow() - timedelta(hours=random.randint(1, 48))
        for offset, (direction, content) in enumerate(template):
            msg = InboxMessage(
                id=gen_id(),
                customer_id=cust.id,
                channel=cust.channel_pref or "Email",
                content=content.format(name=cust.name.split()[0]),
                direction=direction,
                created_at=base_time + timedelta(minutes=offset * 5),
            )
            db.add(msg)
    db.commit()

    # ── Projects ──────────────────────────────────────────────────────────────
    print("🌱 Seeding sample projects …")
    PROJECT_DATA = [
        ("Arjun Sharma",   "arjun.sharma",  "Spring Campaign Design",  "Brand refresh for seasonal sale",    "Apr 15", 1500.00, "In Progress"),
        ("Priya Patel",    "priya.patel",   "Mobile App UI",           "Wireframes and prototype screens",   "Apr 20", 3200.00, "On Review"),
        ("Ravi Kumar",     "ravi.kumar",    "Social Media Pack",       "Graphics for Q2 content calendar",   "Apr 10", 800.00,  "Completed"),
        ("Sneha Reddy",    "sneha.reddy",   "Email Template Suite",    "8 responsive HTML email templates",  "Apr 30", 1200.00, "Draft"),
        ("Kiran Singh",    "kiran.singh",   "Analytics Dashboard",     "Custom metrics dashboard for CRM",   "May 5",  4500.00, "In Progress"),
    ]
    for client_name, client_email, proj_name, proj_desc, due, value, status in PROJECT_DATA:
        p = Project(
            id=gen_id(),
            client_name=client_name,
            client_avatar="",
            client_email=client_email,
            project_name=proj_name,
            project_desc=proj_desc,
            due_date=due,
            contract_value=value,
            status=status,
            has_note=1,
            notes=f"Initial brief approved by {client_name.split()[0]}.",
        )
        db.add(p)
    db.commit()

    db.close()
    print("✅  Seeded: 100 customers | 5 products | 3 segments | 1 demo campaign | 15 inbox threads | 5 projects")


if __name__ == "__main__":
    seed()
