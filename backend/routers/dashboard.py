from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Customer, Campaign, Communication, Receipt, Project
from schemas import DashboardOut, DashboardMetrics, CampaignOut, ActivityItem

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/summary", response_model=DashboardOut)
def dashboard_summary(db: Session = Depends(get_db)):
    total_customers = db.query(Customer).count()
    total_campaigns = db.query(Campaign).count()
    total_sent      = db.query(Communication).filter(Communication.status != "queued").count()
    total_converted = db.query(Communication).filter(Communication.status == "converted").count()
    total_projects  = db.query(Project).count()

    cvr = round(total_converted / total_sent * 100, 1) if total_sent > 0 else 0.0

    # Revenue: sum of all customer total_spend (proxy for revenue)
    revenue_row = db.query(Customer).all()
    total_revenue = round(sum(c.total_spend or 0 for c in revenue_row), 2)

    recent_campaigns = (
        db.query(Campaign)
        .order_by(Campaign.created_at.desc())
        .limit(5)
        .all()
    )

    recent_receipts = (
        db.query(Receipt)
        .order_by(Receipt.received_at.desc())
        .limit(10)
        .all()
    )

    return DashboardOut(
        metrics=DashboardMetrics(
            customers=total_customers,
            campaigns=total_campaigns,
            sent=total_sent,
            cvr=cvr,
            clients=total_customers,
            clientsComparison="+4",
            clientsSubtitle=f"Total CRM contacts",
            revenue=total_revenue,
            revenueComparison="+12%",
            revenueSubtitle="Lifetime customer spend",
            projects=total_projects,
            projectsComparison=f"+{total_projects}",
            projectsSubtitle="Registered projects",
        ),
        recent_campaigns=[
            CampaignOut(
                id=c.id,
                name=c.name,
                channel=c.channel,
                status=c.status,
                created_at=c.created_at,
                segment_name=c.segment.name if c.segment else None,
            )
            for c in recent_campaigns
        ],
        activity_feed=[
            ActivityItem(
                communication_id=r.communication_id,
                event_type=r.event_type,
                received_at=r.received_at.isoformat(),
            )
            for r in recent_receipts
        ],
    )
