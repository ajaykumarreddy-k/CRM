from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from database import get_db
from models import Receipt, Communication
from schemas import ReceiptIn, OkResponse
from datetime import datetime

router = APIRouter(tags=["Receipts"])

# Canonical status progression (index = rank)
STATUS_ORDER = ["queued", "sent", "delivered", "opened", "read", "clicked", "converted", "failed"]


@router.post("/receipts", response_model=OkResponse)
def ingest_receipt(body: ReceiptIn, db: Session = Depends(get_db)):
    """
    Idempotent receipt ingestion.
    - Inserts the receipt (UNIQUE constraint prevents duplicates).
    - Updates communication.status only if the new status is "later" in the funnel
      (or is "failed", which can arrive at any point).
    """
    try:
        receipt = Receipt(
            communication_id=body.communication_id,
            event_type=body.event_type,
            received_at=datetime.utcnow(),
        )
        db.add(receipt)
        db.flush()  # flush first so IntegrityError fires before the UPDATE

        comm = (
            db.query(Communication)
            .filter(Communication.id == body.communication_id)
            .first()
        )
        if comm:
            current_rank = STATUS_ORDER.index(comm.status) if comm.status in STATUS_ORDER else -1
            new_rank     = STATUS_ORDER.index(body.event_type) if body.event_type in STATUS_ORDER else -1

            # Always allow "failed"; otherwise only advance the status forward
            if body.event_type == "failed" or new_rank > current_rank:
                comm.status = body.event_type

        db.commit()

    except IntegrityError:
        db.rollback()  # Duplicate receipt — silently ignore

    return OkResponse()
