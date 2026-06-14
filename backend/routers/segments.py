from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Segment
from schemas import SegmentCreate, SegmentOut, PreviewRequest, PreviewOut, CustomerOut, OkResponse
from services.segment_engine import get_customers_for_rules

router = APIRouter(tags=["Segments"])


@router.get("/segments", response_model=list[SegmentOut])
def list_segments(db: Session = Depends(get_db)):
    return db.query(Segment).order_by(Segment.created_at.desc()).all()


@router.post("/segments/preview", response_model=PreviewOut)
def preview_segment(body: PreviewRequest, db: Session = Depends(get_db)):
    """
    Preview how many customers match a set of rules WITHOUT saving the segment.
    Defined BEFORE /{segment_id} to avoid route shadowing.
    """
    customers = get_customers_for_rules(db, body.rules)
    sample = [CustomerOut.model_validate(c) for c in customers[:5]]
    return PreviewOut(count=len(customers), sample=sample)


@router.post("/segments", response_model=SegmentOut, status_code=201)
def create_segment(body: SegmentCreate, db: Session = Depends(get_db)):
    customers = get_customers_for_rules(db, body.rules)
    seg = Segment(
        name=body.name,
        rules=body.rules,
        customer_count=len(customers),
    )
    db.add(seg)
    db.commit()
    db.refresh(seg)
    return seg


@router.get("/segments/{segment_id}", response_model=SegmentOut)
def get_segment(segment_id: str, db: Session = Depends(get_db)):
    seg = db.query(Segment).filter(Segment.id == segment_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Segment not found")
    return seg


@router.delete("/segments/{segment_id}", response_model=OkResponse)
def delete_segment(segment_id: str, db: Session = Depends(get_db)):
    seg = db.query(Segment).filter(Segment.id == segment_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Segment not found")
    db.delete(seg)
    db.commit()
    return OkResponse()
