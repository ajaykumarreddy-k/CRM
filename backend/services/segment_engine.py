"""
Segment rules engine.

Rules JSON schema:
{
  "operator": "AND" | "OR",
  "rules": [
    { "field": "days_since_last_order", "op": "gte", "value": 30 },
    { "field": "total_spend",           "op": "gte", "value": 1000 },
    { "field": "order_count",           "op": "gte", "value": 2 },
    { "field": "channel_pref",          "op": "eq",  "value": "WhatsApp" }
  ]
}
"""
from sqlalchemy.orm import Session
from models import Customer
from datetime import datetime
from typing import List


# ── Field extractors ──────────────────────────────────────────────────────────

FIELD_MAP = {
    "total_spend":            lambda c: c.total_spend or 0.0,
    "order_count":            lambda c: c.order_count or 0,
    "channel_pref":           lambda c: (c.channel_pref or "").strip(),
    "days_since_last_order":  lambda c: (
        (datetime.utcnow() - c.last_order_date).days
        if c.last_order_date else 9999
    ),
}

# ── Operators ─────────────────────────────────────────────────────────────────

OPS = {
    "eq":  lambda a, b: a == b,
    "neq": lambda a, b: a != b,
    "gte": lambda a, b: a >= b,
    "lte": lambda a, b: a <= b,
    "gt":  lambda a, b: a > b,
    "lt":  lambda a, b: a < b,
}


def evaluate_rule(customer: Customer, rule: dict) -> bool:
    field_fn = FIELD_MAP.get(rule.get("field"))
    op_fn    = OPS.get(rule.get("op"))
    if not field_fn or not op_fn:
        return False
    try:
        actual = field_fn(customer)
        target = rule["value"]
        # coerce numeric strings just in case
        if isinstance(actual, (int, float)) and isinstance(target, str):
            target = type(actual)(target)
        return op_fn(actual, target)
    except Exception:
        return False


def get_customers_for_rules(db: Session, rules: dict) -> List[Customer]:
    """Return all customers that match the given rules JSON."""
    all_customers = db.query(Customer).all()
    operator  = rules.get("operator", "AND").upper()
    rule_list = rules.get("rules", [])

    if not rule_list:
        return all_customers

    result = []
    for customer in all_customers:
        evals = [evaluate_rule(customer, r) for r in rule_list]
        match = all(evals) if operator == "AND" else any(evals)
        if match:
            result.append(customer)
    return result
