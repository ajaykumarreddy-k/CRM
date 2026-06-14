from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Customer
from schemas import CustomerOut, CustomerListOut

router = APIRouter(tags=["Customers"])


@router.get("/customers", response_model=CustomerListOut)
def get_customers(
    search:  str = Query("", description="Search name / email / phone"),
    channel: str = Query("", description="Filter by channel_pref"),
    page:    int = Query(1,  ge=1),
    limit:   int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Customer)

    if search:
        term = f"%{search}%"
        q = q.filter(
            Customer.name.ilike(term)
            | Customer.email.ilike(term)
            | Customer.phone.ilike(term)
        )

    if channel and channel not in ("All Channels", "all", ""):
        q = q.filter(Customer.channel_pref == channel)

    total     = q.count()
    customers = q.order_by(Customer.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return CustomerListOut(
        customers=[CustomerOut.model_validate(c) for c in customers],
        total=total,
    )
