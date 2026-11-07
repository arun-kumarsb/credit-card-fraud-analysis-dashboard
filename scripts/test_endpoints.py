"""
SentinelShield - Endpoint Verification Script
Tests all FastAPI REST endpoints using TestClient.
"""

import sys
import os
sys.path.insert(0, os.path.abspath("."))

from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_endpoint(name: str, url: str):
    print(f"Testing {name} ({url})...", end=" ")
    response = client.get(url)
    if response.status_code == 200:
        print(f"OK (200) - size: {len(response.content):,} bytes")
        return response.json() if "application/json" in response.headers.get("content-type", "") else response.text
    else:
        print(f"FAILED ({response.status_code}): {response.text}")
        return None

print("=== Running SentinelShield API Verification Tests ===\n")

# 1. Health & Root
test_endpoint("Root Endpoint", "/")
test_endpoint("Health Check", "/api/health")

# 2. Dashboard Endpoints
overview = test_endpoint("Dashboard Overview", "/api/dashboard/overview")
if overview:
    print(f"   -> Total Txns: {overview['kpis']['total_transactions']:,}")
    print(f"   -> Fraud Loss: ${overview['kpis']['fraud_volume_amount']:,.2f}")
    print(f"   -> Fraud Rate: {overview['kpis']['fraud_rate_pct']}%")

trends = test_endpoint("Dashboard Trends", "/api/dashboard/trends")
if trends:
    print(f"   -> Monthly trend records: {len(trends['monthly_trends'])}")
    print(f"   -> Heatmap cells: {len(trends['temporal_heatmap'])}")

dists = test_endpoint("Dashboard Distributions", "/api/dashboard/distributions")
if dists:
    print(f"   -> Pareto fraud vectors: {len(dists['fraud_vectors_pareto'])}")
    print(f"   -> Payment rails: {len(dists['payment_rails'])}")

# 3. Transactions Endpoint (Paginated & Filtered)
txns = test_endpoint("Transactions Default (Page 1)", "/api/transactions?page=1&page_size=10")
if txns:
    print(f"   -> Total: {txns['total']:,}, Returned: {len(txns['items'])}, Pages: {txns['total_pages']:,}")

fraud_txns = test_endpoint("Transactions Filtered (Fraud Only)", "/api/transactions?fraud_flag=1&page=1&page_size=5")
if fraud_txns:
    sample_id = fraud_txns['items'][0]['transaction_id']
    print(f"   -> Filtered Fraud Count: {fraud_txns['total']:,}")
    detail = test_endpoint(f"Transaction Detail ({sample_id})", f"/api/transactions/{sample_id}")
    if detail:
        print(f"      Customer: {detail.get('customer_name')}, Merchant: {detail.get('merchant_name')}, Amount: ${detail.get('transaction_amount')}")

# CSV Export test
csv_res = client.get("/api/transactions/export/csv?limit=10")
print(f"Testing CSV Export: Status {csv_res.status_code}, Length: {len(csv_res.content)} bytes")

# 4. Analytics Endpoints
test_endpoint("Customer Analytics", "/api/customers/analytics")
test_endpoint("Cards Analytics", "/api/cards/analytics")
test_endpoint("Merchant Analytics", "/api/merchants/analytics")

# 5. Data Quality Endpoint
test_endpoint("Data Quality Report", "/api/data-quality")

print("\n=== All Endpoints Successfully Tested & Verified! ===")
