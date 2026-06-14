"""
Campaign sender — fires messages to the channel service for each customer
in a segment, then marks the campaign as sent.

IMPORTANT: This runs as a FastAPI BackgroundTask (async). It creates its own
DB session so the request-scoped session is not needed/shared.
"""
import asyncio
import os

import httpx
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Campaign, Communication, Segment
from services.segment_engine import get_customers_for_rules

CHANNEL_URL = os.getenv("CHANNEL_SERVICE_URL", "http://localhost:8001")


async def fire_campaign(campaign_id: str) -> None:
    """
    Background coroutine:
      1. Load campaign + segment from a fresh DB session.
      2. Create one Communication per matching customer.
      3. POST each to the channel service (fire-and-forget).
      4. Mark campaign status = 'sent'.
    """
    db: Session = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return

        segment = db.query(Segment).filter(Segment.id == campaign.segment_id).first()
        if not segment:
            campaign.status = "sent"
            db.commit()
            return

        customers = get_customers_for_rules(db, segment.rules)

        campaign.status = "sending"
        db.commit()

        async with httpx.AsyncClient(timeout=5.0) as client:
            for customer in customers:
                message = campaign.message_template.replace("[name]", customer.name)

                comm = Communication(
                    campaign_id=campaign_id,
                    customer_id=customer.id,
                    channel=campaign.channel,
                    message=message,
                    status="queued",
                )
                db.add(comm)
                db.commit()
                db.refresh(comm)

                recipient = (
                    customer.email
                    if campaign.channel == "Email"
                    else customer.phone
                )

                try:
                    await client.post(
                        f"{CHANNEL_URL}/send",
                        json={
                            "communication_id": comm.id,
                            "customer_id": customer.id,
                            "channel": campaign.channel,
                            "message": message,
                            "recipient": recipient or "",
                        },
                    )
                except Exception:
                    # fire-and-forget: channel service will callback with receipts
                    pass

        campaign.status = "sent"
        db.commit()

    finally:
        db.close()
