"""
XENO Channel Stub Service (port 8001).

Simulates a real messaging gateway:
  - Accepts POST /send
  - Fires delivery lifecycle callbacks back to the CRM (POST /api/receipts)
  - Events: sent → delivered → opened → read → clicked → converted
  - ~10% fail after sent, ~20% of clicked convert

Run: uv run channel   (or)  uvicorn channel_service:app --port 8001 --reload
"""
import asyncio
import os
import random

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()

CRM_RECEIPT_URL = os.getenv("CRM_RECEIPT_URL", "http://localhost:8000/api/receipts")

app = FastAPI(title="XENO Channel Stub", description="Simulated messaging gateway")


class SendRequest(BaseModel):
    communication_id: str
    customer_id: str
    channel: str
    message: str
    recipient: str


async def _post_receipt(client: httpx.AsyncClient, communication_id: str, event_type: str) -> None:
    """Fire-and-forget receipt callback to the CRM."""
    try:
        await client.post(
            CRM_RECEIPT_URL,
            json={"communication_id": communication_id, "event_type": event_type},
            timeout=5.0,
        )
    except Exception:
        pass  # best-effort; CRM may not be running in tests


async def simulate_lifecycle(communication_id: str) -> None:
    """
    Simulate the full message delivery lifecycle with realistic random delays.
    """
    await asyncio.sleep(random.uniform(0.3, 1.0))  # network latency

    async with httpx.AsyncClient() as client:

        # Always: sent
        await _post_receipt(client, communication_id, "sent")

        # 10% → fail immediately after sent
        if random.random() < 0.10:
            await asyncio.sleep(random.uniform(0.5, 1.5))
            await _post_receipt(client, communication_id, "failed")
            return

        # delivered (1–3 s after sent)
        await asyncio.sleep(random.uniform(1.0, 3.0))
        await _post_receipt(client, communication_id, "delivered")

        # 5% stop at delivered (e.g. turned off notifications)
        if random.random() < 0.05:
            return

        # opened — 60% chance
        if random.random() < 0.60:
            await asyncio.sleep(random.uniform(2.0, 6.0))
            await _post_receipt(client, communication_id, "opened")

            # read — 80% of opened
            if random.random() < 0.80:
                await asyncio.sleep(random.uniform(1.0, 3.0))
                await _post_receipt(client, communication_id, "read")

                # clicked — 30% of read
                if random.random() < 0.30:
                    await asyncio.sleep(random.uniform(2.0, 5.0))
                    await _post_receipt(client, communication_id, "clicked")

                    # converted — 20% of clicked
                    if random.random() < 0.20:
                        await asyncio.sleep(random.uniform(1.0, 3.0))
                        await _post_receipt(client, communication_id, "converted")


@app.post("/send")
async def receive_send(body: SendRequest):
    """Accept a send request and kick off the lifecycle simulation in the background."""
    asyncio.create_task(simulate_lifecycle(body.communication_id))
    return {"status": "queued"}


@app.get("/")
def health():
    return {"status": "ok", "service": "XENO Channel Stub"}
