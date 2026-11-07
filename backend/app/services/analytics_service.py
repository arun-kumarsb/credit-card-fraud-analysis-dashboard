"""
SentinelShield - Analytics Service
Provides high-performance analytical metrics for Customers, Cards, and Merchants.
Uses precomputed aggregates for instant sub-10ms delivery for all-time,
and dynamic indexed SQL aggregation when date filters are applied.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas import (
    CustomerAnalyticsResponse,
    CardAnalyticsResponse,
    MerchantAnalyticsResponse
)
from backend.app.services.dashboard_service import load_aggregate

def build_date_where(start_date: Optional[str], end_date: Optional[str], prefix: str = "") -> tuple[str, dict]:
    clauses = ["1=1"]
    params = {}
    col = f"{prefix}transaction_date" if prefix else "transaction_date"
    if start_date:
        clauses.append(f"{col} >= :start_date")
        params["start_date"] = start_date
    if end_date:
        clauses.append(f"{col} <= :end_date")
        params["end_date"] = end_date
    return " AND ".join(clauses), params

class AnalyticsService:
    @staticmethod
    def get_customer_analytics(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> CustomerAnalyticsResponse:
        if not start_date and not end_date:
            segments = load_aggregate("customer_segments") or []
            age_cohorts = load_aggregate("age_groups") or []
            occupations = load_aggregate("occupations") or []
            income_tiers = load_aggregate("income_tier_risk") or []
            account_matrix = load_aggregate("account_type_matrix") or []
            marital_matrix = load_aggregate("marital_status_risk") or []

            return CustomerAnalyticsResponse(
                total_customers=25000,
                avg_annual_income=1611153.23,
                segment_distribution=segments,
                age_cohort_risk=age_cohorts,
                income_tier_risk=income_tiers,
                occupation_risk=occupations,
                account_type_matrix=account_matrix,
                marital_status_risk=marital_matrix
            )

        where_sql, params = build_date_where(start_date, end_date, "t.")

        total_customers = db.execute(text(f"""
            SELECT COUNT(DISTINCT customer_id) FROM transactions t WHERE {where_sql};
        """), params).scalar() or 0

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
            WHERE {where_sql}
            GROUP BY c.customer_segment
            ORDER BY total_amount DESC;
        """), params).mappings().all()

        age_rows = db.execute(text(f"""
            SELECT 
                c.age_group as Age_Group,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions t
            JOIN customers c ON t.customer_id = c.customer_id
            WHERE {where_sql}
            GROUP BY c.age_group
            ORDER BY total_amount DESC;
        """), params).mappings().all()

        occ_rows = db.execute(text(f"""
            SELECT 
                c.occupation as Occupation,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions t
            JOIN customers c ON t.customer_id = c.customer_id
            WHERE {where_sql}
            GROUP BY c.occupation
            ORDER BY fraud_rate_pct DESC
            LIMIT 10;
        """), params).mappings().all()

        income_tiers = load_aggregate("income_tier_risk") or []
        account_matrix = load_aggregate("account_type_matrix") or []
        marital_matrix = load_aggregate("marital_status_risk") or []

        return CustomerAnalyticsResponse(
            total_customers=total_customers,
            avg_annual_income=1611153.23,
            segment_distribution=[dict(r) for r in seg_rows],
            age_cohort_risk=[dict(r) for r in age_rows],
            income_tier_risk=income_tiers,
            occupation_risk=[dict(r) for r in occ_rows],
            account_type_matrix=account_matrix,
            marital_status_risk=marital_matrix
        )

    @staticmethod
    def get_card_analytics(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> CardAnalyticsResponse:
        if not start_date and not end_date:
            networks = load_aggregate("cards_network") or []
            tiers = load_aggregate("cards_tier") or []
            statuses = load_aggregate("cards_status") or []
            limit_tiers = load_aggregate("card_limit_tier_risk") or []
            form_factors = load_aggregate("cards_form_factor") or []
            contactless = load_aggregate("cards_contactless") or []

            return CardAnalyticsResponse(
                total_cards=32457,
                avg_credit_limit=444777.54,
                total_credit_limit_exposure=14436144659.0,
                network_distribution=networks,
                card_type_distribution=tiers,
                operational_status_distribution=statuses,
                form_factor_distribution=form_factors,
                contactless_share=contactless,
                limit_tier_risk=limit_tiers
            )

        where_sql, params = build_date_where(start_date, end_date, "t.")

        total_cards = db.execute(text(f"""
            SELECT COUNT(DISTINCT card_id) FROM transactions t WHERE {where_sql};
        """), params).scalar() or 0

        network_rows = db.execute(text(f"""
            SELECT 
                c.card_network as Card_Network,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions t
            JOIN cards c ON t.card_id = c.card_id
            WHERE {where_sql}
            GROUP BY c.card_network
            ORDER BY total_amount DESC;
        """), params).mappings().all()

        type_rows = db.execute(text(f"""
            SELECT 
                c.card_type as Card_Type,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions t
            JOIN cards c ON t.card_id = c.card_id
            WHERE {where_sql}
            GROUP BY c.card_type
            ORDER BY total_amount DESC;
        """), params).mappings().all()

        status_rows = db.execute(text(f"""
            SELECT 
                c.card_status as Card_Status,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions t
            JOIN cards c ON t.card_id = c.card_id
            WHERE {where_sql}
            GROUP BY c.card_status
            ORDER BY total_amount DESC;
        """), params).mappings().all()

        limit_tiers = load_aggregate("card_limit_tier_risk") or []
        form_factors = load_aggregate("cards_form_factor") or []
        contactless = load_aggregate("cards_contactless") or []

        return CardAnalyticsResponse(
            total_cards=total_cards,
            avg_credit_limit=444777.54,
            total_credit_limit_exposure=14436144659.0,
            network_distribution=[dict(r) for r in network_rows],
            card_type_distribution=[dict(r) for r in type_rows],
            operational_status_distribution=[dict(r) for r in status_rows],
            form_factor_distribution=form_factors,
            contactless_share=contactless,
            limit_tier_risk=limit_tiers
        )

    @staticmethod
    def get_merchant_analytics(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> MerchantAnalyticsResponse:
        if not start_date and not end_date:
            categories = load_aggregate("categories") or []
            watchlist = load_aggregate("top_merchants_watchlist") or []
            risk_dist = load_aggregate("merchant_risk_distribution") or []
            rating_dist = load_aggregate("merchant_rating_vs_fraud") or []

            return MerchantAnalyticsResponse(
                total_merchants=500,
                risk_level_distribution=risk_dist,
                category_risk_comparison=categories,
                top_watchlist=watchlist,
                rating_vs_fraud=rating_dist
            )

        where_sql, params = build_date_where(start_date, end_date, "t.")
        where_sql_plain, params_plain = build_date_where(start_date, end_date)

        total_merchants = db.execute(text(f"""
            SELECT COUNT(DISTINCT merchant_id) FROM transactions WHERE {where_sql_plain};
        """), params_plain).scalar() or 0

        risk_rows = db.execute(text(f"""
            SELECT 
                merchant_risk_level as Risk_Level,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions
            WHERE {where_sql_plain}
            GROUP BY merchant_risk_level
            ORDER BY total_amount DESC;
        """), params_plain).mappings().all()

        cat_rows = db.execute(text(f"""
            SELECT 
                merchant_category as Merchant_Category,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions
            WHERE {where_sql_plain}
            GROUP BY merchant_category
            ORDER BY fraud_amount DESC;
        """), params_plain).mappings().all()

        watchlist_rows = db.execute(text(f"""
            SELECT 
                t.merchant_id as Merchant_ID,
                m.merchant_name as Merchant_Name,
                m.merchant_category as Merchant_Category,
                COUNT(*) as total_txns,
                ROUND(COALESCE(SUM(t.transaction_amount), 0), 2) as total_amount,
                SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_txns,
                ROUND(COALESCE(SUM(CASE WHEN t.fraud_flag = 1 THEN t.transaction_amount ELSE 0 END), 0), 2) as fraud_amount,
                ROUND(100.0 * SUM(CASE WHEN t.fraud_flag = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as fraud_rate_pct
            FROM transactions t
            JOIN merchants m ON t.merchant_id = m.merchant_id
            WHERE {where_sql}
            GROUP BY t.merchant_id, m.merchant_name, m.merchant_category
            ORDER BY fraud_amount DESC
            LIMIT 10;
        """), params).mappings().all()

        rating_dist = load_aggregate("merchant_rating_vs_fraud") or []

        return MerchantAnalyticsResponse(
            total_merchants=total_merchants,
            risk_level_distribution=[dict(r) for r in risk_rows],
            category_risk_comparison=[dict(r) for r in cat_rows],
            top_watchlist=[dict(r) for r in watchlist_rows],
            rating_vs_fraud=rating_dist
        )
