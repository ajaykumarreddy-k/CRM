from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Campaign, Communication
from schemas import CampaignCreate, CampaignOut, CampaignStatsOut, OkResponse
from services.campaign_sender import fire_campaign
from services.gemini import call_gemini_json
import json

router = APIRouter(tags=["Campaigns"])


@router.get("/campaigns", response_model=list[CampaignOut])
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()
    return [
        CampaignOut(
            id=c.id,
            name=c.name,
            channel=c.channel,
            status=c.status,
            created_at=c.created_at,
            segment_name=c.segment.name if c.segment else None,
        )
        for c in campaigns
    ]


@router.post("/campaigns", response_model=CampaignOut, status_code=201)
def create_campaign(
    body: CampaignCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    campaign = Campaign(
        name=body.name,
        segment_id=body.segment_id,
        channel=body.channel,
        message_template=body.message_template,
        status="draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # fire_campaign is async — BackgroundTasks handles coroutines natively
    background_tasks.add_task(fire_campaign, campaign.id)

    return CampaignOut(
        id=campaign.id,
        name=campaign.name,
        channel=campaign.channel,
        status=campaign.status,
        created_at=campaign.created_at,
        segment_name=campaign.segment.name if campaign.segment else None,
    )


@router.get("/campaigns/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return CampaignOut(
        id=c.id, name=c.name, channel=c.channel, status=c.status,
        created_at=c.created_at,
        segment_name=c.segment.name if c.segment else None,
    )


@router.get("/campaigns/{campaign_id}/stats", response_model=CampaignStatsOut)
def campaign_stats(campaign_id: str, db: Session = Depends(get_db)):
    comms = (
        db.query(Communication)
        .filter(Communication.campaign_id == campaign_id)
        .all()
    )

    counts: dict[str, int] = {
        s: 0 for s in ("queued", "sent", "delivered", "opened", "read", "clicked", "converted", "failed")
    }
    for c in comms:
        if c.status in counts:
            counts[c.status] += 1

    total = len(comms)

    def pct(a: int, b: int) -> float:
        return round(a / b * 100, 1) if b > 0 else 0.0

    return CampaignStatsOut(
        total=total,
        **counts,
        pct_delivered=pct(counts["delivered"], counts["sent"]),
        pct_opened=pct(counts["opened"], counts["delivered"]),
        pct_clicked=pct(counts["clicked"], counts["opened"]),
        pct_converted=pct(counts["converted"], counts["clicked"]),
        statusBreakdown={
            "delivered": counts["delivered"],
            "failed": counts["failed"],
            "pending": counts["queued"] + counts["sent"],
        },
    )


@router.get("/campaigns/{campaign_id}/insight")
def campaign_insight(campaign_id: str, db: Session = Depends(get_db)):
    """AI-generated insight for a campaign based on its live stats."""
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")

    comms = db.query(Communication).filter(Communication.campaign_id == campaign_id).all()
    counts: dict = {s: 0 for s in ("queued", "sent", "delivered", "opened", "read", "clicked", "converted", "failed")}
    for comm in comms:
        if comm.status in counts:
            counts[comm.status] += 1

    total = len(comms)

    INSIGHT_SYSTEM = """You are a CRM analyst. Given campaign statistics, return JSON:
{"insight": "2-3 sentence analysis of the campaign performance", "action": "one clear actionable next step"}"""

    stats_summary = json.dumps({"campaign": c.name, "channel": c.channel, "total": total, **counts})
    try:
        result = call_gemini_json(INSIGHT_SYSTEM, stats_summary)
        # Normalise: frontend expects {insight, action}
        if "suggested_action" in result and "action" not in result:
            result["action"] = result.pop("suggested_action")
        return result
    except Exception:
        return {"insight": f"Campaign '{c.name}' sent {total} messages. {counts['delivered']} delivered, {counts['converted']} converted.", "action": "Send a follow-up to unopened contacts."}


@router.delete("/campaigns/{campaign_id}", response_model=OkResponse)
def delete_campaign(campaign_id: str, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(c)
    db.commit()
    return OkResponse()


@router.post("/campaigns/{campaign_id}/toggle", response_model=CampaignOut)
def toggle_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Pause a running campaign or resume a paused one."""
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if c.status == "paused":
        c.status = "sent"
    elif c.status in ("sent", "sending"):
        c.status = "paused"
    db.commit()
    db.refresh(c)
    return CampaignOut(
        id=c.id,
        name=c.name,
        channel=c.channel,
        status=c.status,
        created_at=c.created_at,
        segment_name=c.segment.name if c.segment else None,
    )
