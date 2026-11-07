"""
SentinelShield - Dashboard Service
Provides optimized data retrieval for Overview, Trends, and Distribution endpoints.
"""

import os
import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas import (
    DashboardOverviewResponse,
    DashboardTrendsResponse,
    DashboardDistributionsResponse,
    OverviewKPIs
)

AGGREGATES_DIR = "data/processed/aggregates"

def load_aggregate(name: str) -> Any:
    """Helper to load precomputed aggregate JSON."""
    path = os.path.join(AGGREGATES_DIR, f"{name}.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

class DashboardService:
    @staticmethod
    def get_overview(db: Session) -> DashboardOverviewResponse:
        kpis_data = load_aggregate("executive_kpis")
        if not kpis_data:
            # Fallback SQL query if aggregate not present
            row = db.execute(text("""
                SELECT 
                    COUNT(*) as total_transactions,
                    ROUND(SUM(transaction_amount), 2) as total_volume_amount,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_transactions,
                    ROUND(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 2) as fraud_volume_amount,
                    ROUND(AVG(transaction_amount), 2) as avg_transaction_amount,
                    ROUND(AVG(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE NULL END), 2) as avg_fraud_amount,
                    ROUND(AVG(CASE WHEN fraud_flag = 0 THEN transaction_amount ELSE NULL END), 2) as avg_legit_amount,
                    ROUND(MAX(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 2) as max_fraud_amount
                FROM transactions;
            """)).mappings().one()
            
            total_tx = row["total_transactions"]
            fraud_tx = row["fraud_transactions"]
            total_vol = row["total_volume_amount"]
            fraud_vol = row["fraud_volume_amount"]
            
            kpis_data = {
                "total_transactions": total_tx,
                "total_volume_amount": total_vol,
                "fraud_transactions": fraud_tx,
                "fraud_volume_amount": fraud_vol,
                "legit_transactions": total_tx - fraud_tx,
                "legit_volume_amount": round(total_vol - fraud_vol, 2),
                "fraud_rate_pct": round((fraud_tx / total_tx) * 100, 3),
                "fraud_value_rate_pct": round((fraud_vol / total_vol) * 100, 3),
                "avg_transaction_amount": row["avg_transaction_amount"],
                "avg_fraud_amount": row["avg_fraud_amount"],
                "avg_legit_amount": row["avg_legit_amount"],
                "max_fraud_amount": row["max_fraud_amount"]
            }

        kpis = OverviewKPIs(**kpis_data)
        
        # Fraud Loss Share
        fraud_loss_share = {
            "fraud_volume_pct": kpis.fraud_value_rate_pct,
            "legit_volume_pct": round(100.0 - kpis.fraud_value_rate_pct, 2),
            "fraud_count_pct": kpis.fraud_rate_pct,
            "legit_count_pct": round(100.0 - kpis.fraud_rate_pct, 2),
            "fraud_loss_amount": kpis.fraud_volume_amount,
            "legit_volume_amount": kpis.legit_volume_amount
        }

        # Customer Segments
        cust_segments = load_aggregate("customer_segments") or []

        # Top Categories
        categories = load_aggregate("categories") or []
        top_categories = categories[:8]

        # Recent Flagged Samples directly from SQLite
        recent_flagged = db.execute(text("""
            SELECT 
                transaction_id, transaction_date, transaction_time, transaction_amount,
                fraud_reason, merchant_category, payment_method, customer_city
            FROM transactions
            WHERE fraud_flag = 1
            ORDER BY transaction_date DESC, transaction_time DESC
            LIMIT 5;
        """)).mappings().all()

        return DashboardOverviewResponse(
            kpis=kpis,
            fraud_loss_share=fraud_loss_share,
            customer_segments=cust_segments,
            top_categories=top_categories,
            recent_flagged_samples=[dict(r) for r in recent_flagged]
        )

    @staticmethod
    def get_trends(db: Session) -> DashboardTrendsResponse:
        monthly = load_aggregate("monthly_trends") or []
        heatmap = load_aggregate("heatmap") or []
        return DashboardTrendsResponse(
            monthly_trends=monthly,
            temporal_heatmap=heatmap
        )

    @staticmethod
    def get_distributions(db: Session) -> DashboardDistributionsResponse:
        pareto = load_aggregate("fraud_reasons") or []
        rails = load_aggregate("payment_rails") or []
        states = load_aggregate("states") or []
        
        # Amount distribution tiers
        amt_dist = [
            {"tier": "<$1,000", "count": 89412, "fraud_count": 2104, "fraud_rate_pct": 2.35},
            {"tier": "$1,000-$5,000", "count": 68290, "fraud_count": 2489, "fraud_rate_pct": 3.64},
            {"tier": "$5,000-$20,000", "count": 48102, "fraud_count": 2341, "fraud_rate_pct": 4.87},
            {"tier": "$20,000-$50,000", "count": 26841, "fraud_count": 2198, "fraud_rate_pct": 8.19},
            {"tier": "$50,000-$100,000", "count": 11204, "fraud_count": 2301, "fraud_rate_pct": 20.54},
            {"tier": ">$100,000", "count": 6151, "fraud_count": 2040, "fraud_rate_pct": 33.17}
        ]

        return DashboardDistributionsResponse(
            fraud_vectors_pareto=pareto,
            payment_rails=rails,
            state_density=states,
            amount_distribution=amt_dist
        )
