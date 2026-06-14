import json
from fastapi import APIRouter
from schemas import SegmentAIReq, DraftAIReq, InsightAIReq, ChatAIReq, InboxDraftAIReq
from services.gemini import call_gemini_json, call_gemini_text

router = APIRouter(tags=["AI"])

# ── Prompt templates ──────────────────────────────────────────────────────────

SEGMENT_SYSTEM = """You are a CRM segmentation engine. Return ONLY valid JSON.
Schema: {"operator": "AND", "rules": [{"field": str, "op": str, "value": any}]}
Valid fields: days_since_last_order (int), total_spend (float), order_count (int), channel_pref (str: WhatsApp|SMS|Email|RCS)
Valid ops: eq, neq, gte, lte, gt, lt"""

DRAFT_SYSTEM = """You are a marketing copywriter for a D2C brand.
Write a short personalized message. Max 160 chars for SMS, 300 for others.
Use [name] as placeholder for the customer name.
Return ONLY the message text — no quotes, no explanation."""

INSIGHT_SYSTEM = """You are a CRM analyst. Given campaign statistics, return JSON:
{"insight": "2-3 sentence analysis of the campaign performance", "suggested_action": "one clear actionable next step"}"""

CHAT_SYSTEM = """You are an AI assistant for XENO CRM, a marketing platform.
Help marketers find customer audiences, draft campaign messages, and understand campaign results.
Return JSON: {"reply": str, "action_type": "segment"|"draft"|null, "action_data": any}
- If the user wants to find/create a segment: action_type="segment", action_data=rules JSON object.
- If the user wants to draft a message: action_type="draft", action_data={"message": str}.
- Otherwise: action_type=null, action_data=null."""

INBOX_DRAFT_SYSTEM = """You are a helpful CRM assistant. Given a conversation history between
a business user and a client, generate a short, professional, friendly reply draft.
Return ONLY the reply text — no quotes, no explanation. Max 200 characters."""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/ai/segment")
def ai_segment(body: SegmentAIReq):
    """Convert a natural language prompt into a segment rules JSON."""
    result = call_gemini_json(SEGMENT_SYSTEM, body.prompt)
    return {"rules": result}


@router.post("/ai/draft")
def ai_draft(body: DraftAIReq):
    """Generate a personalised campaign message for a given goal and audience."""
    segment_label = body.resolved_segment
    user_prompt = f"Channel: {body.channel}. Goal: {body.goal}. Audience: {segment_label}"
    message = call_gemini_text(DRAFT_SYSTEM, user_prompt)
    return {"message": message, "draft": message}


@router.post("/ai/insight")
def ai_insight(body: InsightAIReq):
    """Return a human-readable analysis and suggested action from campaign stats."""
    result = call_gemini_json(INSIGHT_SYSTEM, json.dumps(body.stats))
    return result


@router.post("/ai/inbox-draft")
def ai_inbox_draft(body: InboxDraftAIReq):
    """Generate a smart reply draft for the inbox based on conversation history."""
    history_str = "\n".join(
        f"{m.get('sender', 'user').capitalize()}: {m.get('text', '')}"
        for m in body.conversationHistory[-6:]
    )
    user_prompt = f"Client name: {body.contactName}\nConversation:\n{history_str}"
    draft = call_gemini_text(INBOX_DRAFT_SYSTEM, user_prompt)
    return {"draft": draft}


@router.post("/ai/chat")
def ai_chat(body: ChatAIReq):
    """
    Conversational CRM assistant.
    Returns {reply, action_type, action_data} — action_type may trigger
    frontend UI actions (e.g. pre-fill a segment builder or draft editor).
    """
    history_str = "\n".join(
        f"{m.role.capitalize()}: {m.content}" for m in body.history[-6:]
    )
    user_prompt = f"History:\n{history_str}\n\nUser: {body.message}"
    result = call_gemini_json(CHAT_SYSTEM, user_prompt)
    return result
