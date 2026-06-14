#!/usr/bin/env python3
"""
XENO CRM — Full API Curl/HTTP Test Suite
Run: python3 test_api.py
Requires the backend to be running on http://localhost:8000
"""
import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"

PASS = "\033[92m✅ PASS\033[0m"
FAIL = "\033[91m❌ FAIL\033[0m"
INFO = "\033[94mℹ️  INFO\033[0m"

results = []


def req(method: str, path: str, body: dict = None) -> tuple[int, dict]:
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=8) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.reason}
    except Exception as e:
        return 0, {"error": str(e)}


def test(label: str, method: str, path: str, body: dict = None,
         expect_status: int = 200, check_keys: list[str] = None):
    status, data = req(method, path, body)
    ok = status == expect_status
    if check_keys:
        for k in check_keys:
            if k not in data:
                ok = False
    tag = PASS if ok else FAIL
    print(f"{tag}  [{status}] {method} {path}")
    if not ok:
        print(f"       Response: {json.dumps(data)[:200]}")
    elif check_keys:
        vals = {k: data[k] if not isinstance(data[k], (list, dict)) else f"[{type(data[k]).__name__}]" for k in check_keys}
        print(f"       {vals}")
    results.append((label, ok))
    return status, data


print("\n" + "=" * 60)
print("  XENO CRM — Backend API Test Suite")
print("=" * 60 + "\n")

# ── Health ────────────────────────────────────────────────────────────────────
print("── Health ──────────────────────────────────────")
test("Health", "GET", "/", check_keys=["status"])

# ── Dashboard ─────────────────────────────────────────────────────────────────
print("\n── Dashboard ───────────────────────────────────")
status, dash = test("Dashboard Summary", "GET", "/api/dashboard/summary", check_keys=["metrics", "recent_campaigns", "activity_feed"])
if "metrics" in dash:
    m = dash["metrics"]
    print(f"       customers={m.get('customers')}, campaigns={m.get('campaigns')}, sent={m.get('sent')}, revenue={m.get('revenue')}, projects={m.get('projects')}")

# ── Customers ─────────────────────────────────────────────────────────────────
print("\n── Customers ───────────────────────────────────")
status, custs = test("List Customers", "GET", "/api/customers", check_keys=["customers", "total"])
if "total" in custs:
    print(f"       Total customers: {custs['total']}")
test("Search Customers", "GET", "/api/customers?search=Arjun")
test("Filter by Channel", "GET", "/api/customers?channel=WhatsApp")

# ── Segments ──────────────────────────────────────────────────────────────────
print("\n── Segments ────────────────────────────────────")
status, segs = test("List Segments", "GET", "/api/segments")
seg_id = segs[0]["id"] if isinstance(segs, list) and segs else None
if seg_id:
    print(f"       Got {len(segs)} segments, first ID: {seg_id[:8]}...")
    test("Get Segment", "GET", f"/api/segments/{seg_id}", check_keys=["id", "name", "rules"])
test("Preview Segment", "POST", "/api/segments/preview",
     body={"rules": {"operator": "AND", "rules": [{"field": "order_count", "op": "gte", "value": 2}]}},
     expect_status=200, check_keys=["count", "sample"])
test("Create Segment", "POST", "/api/segments",
     body={"name": "Test Segment", "rules": {"operator": "AND", "rules": [{"field": "total_spend", "op": "gte", "value": 100}]}},
     expect_status=201, check_keys=["id", "name"])

# ── Campaigns ─────────────────────────────────────────────────────────────────
print("\n── Campaigns ───────────────────────────────────")
status, camps = test("List Campaigns", "GET", "/api/campaigns")
camp_id = camps[0]["id"] if isinstance(camps, list) and camps else None
if camp_id:
    print(f"       Got {len(camps)} campaigns, first: {camps[0].get('name')}")
    test("Get Campaign", "GET", f"/api/campaigns/{camp_id}", check_keys=["id", "name", "status"])
    test("Campaign Stats", "GET", f"/api/campaigns/{camp_id}/stats", check_keys=["total", "sent", "delivered"])
    test("Toggle Campaign", "POST", f"/api/campaigns/{camp_id}/toggle", expect_status=200, check_keys=["id", "status"])

if seg_id:
    test("Create Campaign", "POST", "/api/campaigns",
         body={"name": "Test Campaign", "segment_id": seg_id, "channel": "Email", "message_template": "Hey [name], test!"},
         expect_status=201, check_keys=["id", "name"])

# ── Products ──────────────────────────────────────────────────────────────────
print("\n── Products ────────────────────────────────────")
status, prods = test("List Products", "GET", "/api/products", check_keys=["products", "stats"])
if "products" in prods:
    print(f"       Catalog items: {prods['stats'].get('catalog_items')}, Stock value: ${prods['stats'].get('total_stock_value')}")
    prod_id = prods["products"][0]["id"] if prods["products"] else None
    if prod_id:
        test("Update Product", "PUT", f"/api/products/{prod_id}",
             body={"name": "Updated T-Shirt", "category": "Apparel", "price": 29.99, "stock_quantity": 100, "description": "Updated"},
             expect_status=200, check_keys=["id", "name"])
test("Create Product", "POST", "/api/products",
     body={"name": "New Test Product", "category": "Test", "price": 9.99, "stock_quantity": 50},
     expect_status=201, check_keys=["id", "name"])

# ── Inbox ─────────────────────────────────────────────────────────────────────
print("\n── Inbox ───────────────────────────────────────")
status, inbox = test("List Inbox Contacts", "GET", "/api/inbox")
if isinstance(inbox, list) and inbox:
    print(f"       {len(inbox)} contacts, first: {inbox[0].get('name')}, msgs: {len(inbox[0].get('messages', []))}")
    contact_id = inbox[0]["id"]
    test("Send Message", "POST", f"/api/inbox/{contact_id}/messages",
         body={"text": "Hello from test suite!", "sender": "user"},
         expect_status=200, check_keys=["id", "text", "sender"])
    test("Mark as Read", "PUT", f"/api/inbox/{contact_id}/read", body={},
         expect_status=200, check_keys=["ok"])

# ── Projects ──────────────────────────────────────────────────────────────────
print("\n── Projects ────────────────────────────────────")
status, projs = test("List Projects", "GET", "/api/projects")
if isinstance(projs, list):
    print(f"       {len(projs)} projects")
    if projs:
        proj_id = projs[0]["id"]
        test("Update Project", "PUT", f"/api/projects/{proj_id}",
             body={"clientName": projs[0]["clientName"], "clientEmail": projs[0]["clientEmail"],
                   "projectName": "Updated Project Name", "projectDesc": projs[0]["projectDesc"],
                   "dueDate": projs[0]["dueDate"], "contractValue": projs[0]["contractValue"],
                   "status": "Completed", "hasNote": True, "notes": "Marked complete via test"},
             expect_status=200, check_keys=["id", "projectName"])
test("Create Project", "POST", "/api/projects",
     body={"clientName": "Test Client", "clientEmail": "test@test.com", "projectName": "API Test Project",
           "projectDesc": "Created by test suite", "dueDate": "Jun 30", "contractValue": 500.0,
           "status": "Draft", "hasNote": False, "notes": ""},
     expect_status=201, check_keys=["id", "projectName"])

# ── Receipts ──────────────────────────────────────────────────────────────────
print("\n── Receipts ────────────────────────────────────")
# Get a communication id first
status, camps2 = req("GET", "/api/campaigns")
if isinstance(camps2, list) and camps2:
    status2, stats2 = req("GET", f"/api/campaigns/{camps2[0]['id']}/stats")
print("       (Receipts require a valid communication_id from a campaign send)")

# ── Final Summary ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  TEST SUMMARY")
print("=" * 60)
passed = sum(1 for _, ok in results if ok)
total  = len(results)
for label, ok in results:
    tag = "✅" if ok else "❌"
    print(f"  {tag}  {label}")

print(f"\n  {passed}/{total} tests passed")
if passed == total:
    print("  \033[92m🎉 All tests passed! Backend is fully integrated.\033[0m")
else:
    print(f"  \033[91m⚠️  {total - passed} test(s) failed.\033[0m")
print()
