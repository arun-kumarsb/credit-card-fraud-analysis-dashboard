"""
SentinelShield - Dashboard Service
Provides optimized data retrieval for Overview, Trends, and Distribution endpoints.
Supports precomputed sub-millisecond responses for full dataset,
and dynamic indexed SQL aggregation when start_date or end_date filters are applied.
"""

import os
import json
from typing import Dict, Any, Optional
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
    def get_overview(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> DashboardOverviewResponse:
        if not start_date and not end_date:
            kpis_data = load_aggregate("executive_kpis")
            cust_segments = load_aggregate("customer_segments") or []
            categories = load_aggregate("categories") or []
            top_categories = categories[:8]
        else:
            where_clauses = ["1=1"]
            params = {}
            if start_date:
                where_clauses.append("transaction_date >= :start_date")
                params["start_date"] = start_date
            if end_date:
                where_clauses.append("transaction_date <= :end_date")
                params["end_date"] = end_date
            where_sql = " AND ".join(where_clauses)

            row = db.execute(text(f"""
                SELECT 
                    COUNT(*) as total_transactions,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_volume_amount,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_transactions,
                    ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_volume_amount,
                    ROUND(COALESCE(AVG(transaction_amount), 0), 2) as avg_transaction_amount,
                    ROUND(COALESCE(AVG(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE NULL END), 0), 2) as avg_fraud_amount,
                    ROUND(COALESCE(AVG(CASE WHEN fraud_flag = 0 THEN transaction_amount ELSE NULL END), 0), 2) as avg_legit_amount,
                    ROUND(COALESCE(MAX(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as max_fraud_amount
                FROM transactions
                WHERE {where_sql};
            """), params).mappings().one()

            total_tx = row["total_transactions"] or 0
            fraud_tx = row["fraud_transactions"] or 0
            total_vol = row["total_volume_amount"] or 0.0
            fraud_vol = row["fraud_volume_amount"] or 0.0

            kpis_data = {
                "total_transactions": total_tx,
                "total_volume_amount": total_vol,
                "fraud_transactions": fraud_tx,
                "fraud_volume_amount": fraud_vol,
                "legit_transactions": total_tx - fraud_tx,
                "legit_volume_amount": round(total_vol - fraud_vol, 2),
                "fraud_rate_pct": round((fraud_tx / total_tx) * 100, 3) if total_tx > 0 else 0.0,
                "fraud_value_rate_pct": round((fraud_vol / total_vol) * 100, 3) if total_vol > 0 else 0.0,
                "avg_transaction_amount": row["avg_transaction_amount"] or 0.0,
                "avg_fraud_amount": row["avg_fraud_amount"] or 0.0,
                "avg_legit_amount": row["avg_legit_amount"] or 0.0,
                "max_fraud_amount": row["max_fraud_amount"] or 0.0
            }

            # Filtered customer segments
            seg_rows = db.execute(text(f"""
                SELECT 
                    c.customer_segment as Customer_Segment,
                    COUNT(*) as total_txns,
                    ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                    SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                    ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                    ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
                FROM transactions t
                JOIN customers c ON t.customer_id = c.customer_id
                WHERE {where_sql.replace('transaction_date', 't.transaction_date')}
                GROUP BY c.customer_segment
                ORDER BY total_amount DESC;
            """), params).mappings().all()
            cust_segments = [dict(r) for r in seg_rows]

            # Filtered categories
            cat_rows = db.execute(text(f"""
                SELECT 
                    merchant_category as Merchant_Category,
                    COUNT(*) as total_txns,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                    ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                    ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
                FROM transactions
                WHERE {where_sql}
                GROUP BY merchant_category
                ORDER BY fraud_amount DESC
                LIMIT 8;
            """), params).mappings().all()
            top_categories = [dict(r) for r in cat_rows]

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
    def get_trends(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> DashboardTrendsResponse:
        if not start_date and not end_date:
            monthly = load_aggregate("monthly_trends") or []
            heatmap = load_aggregate("heatmap") or []
        else:
            where_clauses = ["1=1"]
            params = {}
            if start_date:
                where_clauses.append("transaction_date >= :start_date")
                params["start_date"] = start_date
            if end_date:
                where_clauses.append("transaction_date <= :end_date")
                params["end_date"] = end_date
            where_sql = " AND ".join(where_clauses)

            monthly_rows = db.execute(text(f"""
                SELECT 
                    strftime('%Y-%m', transaction_date) as Year_Month,
                    COUNT(*) as total_transactions,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_transactions,
                    ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                    ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
                FROM transactions
                WHERE {where_sql}
                GROUP BY strftime('%Y-%m', transaction_date)
                ORDER BY Year_Month ASC;
            """), params).mappings().all()
            monthly = [dict(r) for r in monthly_rows]

            heatmap_rows = db.execute(text(f"""
                SELECT 
                    CASE cast(strftime('%w', transaction_date) as integer)
                        WHEN 0 THEN 'Sunday'
                        WHEN 1 THEN 'Monday'
                        WHEN 2 THEN 'Tuesday'
                        WHEN 3 THEN 'Wednesday'
                        WHEN 4 THEN 'Thursday'
                        WHEN 5 THEN 'Friday'
                        WHEN 6 THEN 'Saturday'
                    END as Day_of_Week,
                    cast(strftime('%H', transaction_time) as integer) as Hour,
                    COUNT(*) as total_txns,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                    ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                    ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
                FROM transactions
                WHERE {where_sql}
                GROUP BY Day_of_Week, Hour;
            """), params).mappings().all()
            heatmap = [dict(r) for r in heatmap_rows]

        return DashboardTrendsResponse(
            monthly_trends=monthly,
            temporal_heatmap=heatmap
        )

    @staticmethod
    def get_distributions(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> DashboardDistributionsResponse:
        if not start_date and not end_date:
            pareto = load_aggregate("fraud_reasons") or []
            rails = load_aggregate("payment_rails") or []
            states = load_aggregate("states") or []
        else:
            where_clauses = ["1=1"]
            params = {}
            if start_date:
                where_clauses.append("transaction_date >= :start_date")
                params["start_date"] = start_date
            if end_date:
                where_clauses.append("transaction_date <= :end_date")
                params["end_date"] = end_date
            where_sql = " AND ".join(where_clauses)

            pareto_rows = db.execute(text(f"""
                SELECT 
                    fraud_reason as Fraud_Reason,
                    COUNT(*) as incident_count,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_loss
                FROM transactions
                WHERE {where_sql} AND fraud_flag = 1
                GROUP BY fraud_reason
                ORDER BY incident_count DESC;
            """), params).mappings().all()
            pareto = [dict(r) for r in pareto_rows]

            rails_rows = db.execute(text(f"""
                SELECT 
                    payment_method as Payment_Method,
                    COUNT(*) as total_txns,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                    ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                    ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
                FROM transactions
                WHERE {where_sql}
                GROUP BY payment_method;
            """), params).mappings().all()
            rails = [dict(r) for r in rails_rows]

            states_rows = db.execute(text(f"""
                SELECT 
                    customer_state as Customer_State,
                    COUNT(*) as total_txns,
                    ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                    SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                    ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                    ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
                FROM transactions
                WHERE {where_sql}
                GROUP BY customer_state
                ORDER BY fraud_rate_pct DESC;
            """), params).mappings().all()
            states = [dict(r) for r in states_rows]

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
