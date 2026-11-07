"""
SentinelShield - Transaction Service
Handles paginated queries, multi-criteria filtering, search, sorting, and detail lookups.
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas import (
    PaginatedTransactionsResponse,
    TransactionListItem,
    TransactionDetail
)

class TransactionService:
    @staticmethod
    def get_transactions(
        db: Session,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        fraud_flag: Optional[int] = None,
        category: Optional[str] = None,
        payment_method: Optional[str] = None,
        status: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        sort_by: str = "transaction_datetime",
        sort_order: str = "desc"
    ) -> PaginatedTransactionsResponse:
        
        # Build dynamic WHERE clauses safely
        where_clauses = ["1=1"]
        params: Dict[str, Any] = {}

        if search and search.strip():
            s = f"%{search.strip()}%"
            where_clauses.append("(transaction_id LIKE :search OR customer_id LIKE :search OR card_id LIKE :search OR merchant_id LIKE :search)")
            params["search"] = s

        if fraud_flag is not None:
            where_clauses.append("fraud_flag = :fraud_flag")
            params["fraud_flag"] = fraud_flag

        if category and category.strip() and category != "All":
            where_clauses.append("merchant_category = :category")
            params["category"] = category.strip()

        if payment_method and payment_method.strip() and payment_method != "All":
            where_clauses.append("payment_method = :payment_method")
            params["payment_method"] = payment_method.strip()

        if status and status.strip() and status != "All":
            where_clauses.append("transaction_status = :status")
            params["status"] = status.strip()

        if date_from and date_from.strip():
            where_clauses.append("transaction_date >= :date_from")
            params["date_from"] = date_from.strip()

        if date_to and date_to.strip():
            where_clauses.append("transaction_date <= :date_to")
            params["date_to"] = date_to.strip()

        if min_amount is not None:
            where_clauses.append("transaction_amount >= :min_amount")
            params["min_amount"] = min_amount

        if max_amount is not None:
            where_clauses.append("transaction_amount <= :max_amount")
            params["max_amount"] = max_amount

        where_sql = " AND ".join(where_clauses)

        # Validate sort column to prevent SQL injection
        allowed_sort_cols = {
            "transaction_id", "transaction_date", "transaction_datetime", 
            "transaction_amount", "fraud_flag", "merchant_category", 
            "payment_method", "customer_state"
        }
        safe_sort_by = sort_by if sort_by in allowed_sort_cols else "transaction_datetime"
        safe_sort_order = "ASC" if sort_order.lower() == "asc" else "DESC"

        # 1. Count & summary query
        summary_query = text(f"""
            SELECT 
                COUNT(*) as total_count,
                COALESCE(SUM(transaction_amount), 0) as filtered_total_amount,
                COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END), 0) as filtered_fraud_count,
                COALESCE(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 0) as filtered_fraud_amount
            FROM transactions
            WHERE {where_sql};
        """)
        summary_res = db.execute(summary_query, params).mappings().one()
        total_items = summary_res["total_count"]
        filtered_amount = round(float(summary_res["filtered_total_amount"]), 2)
        filtered_fraud_count = int(summary_res["filtered_fraud_count"])
        filtered_fraud_amount = round(float(summary_res["filtered_fraud_amount"]), 2)

        total_pages = max(1, (total_items + page_size - 1) // page_size) if total_items > 0 else 1
        page = max(1, min(page, total_pages))
        offset = (page - 1) * page_size

        # 2. Page records query
        items_query = text(f"""
            SELECT 
                transaction_id, customer_id, card_id, merchant_id,
                transaction_date, transaction_time, transaction_datetime,
                transaction_amount, payment_method, transaction_channel,
                device_type, transaction_status, is_international,
                fraud_flag, fraud_reason, merchant_risk_level,
                merchant_category, customer_state, customer_city,
                amount_to_limit_ratio
            FROM transactions
            WHERE {where_sql}
            ORDER BY {safe_sort_by} {safe_sort_order}
            LIMIT :limit OFFSET :offset;
        """)
        params_with_paging = {**params, "limit": page_size, "offset": offset}
        rows = db.execute(items_query, params_with_paging).mappings().all()

        items = [TransactionListItem(**dict(r)) for r in rows]

        return PaginatedTransactionsResponse(
            items=items,
            total=total_items,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
            summary_of_filtered={
                "filtered_total_count": total_items,
                "filtered_total_amount": filtered_amount,
                "filtered_fraud_count": filtered_fraud_count,
                "filtered_fraud_amount": filtered_fraud_amount,
                "filtered_fraud_rate_pct": round((filtered_fraud_count / total_items * 100), 2) if total_items > 0 else 0.0
            }
        )

    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: str) -> Optional[TransactionDetail]:
        sql = text("""
            SELECT 
                t.*,
                c.customer_name,
                c.occupation as customer_occupation,
                c.customer_segment,
                cd.card_network,
                cd.card_type,
                cd.card_status,
                m.merchant_name,
                m.merchant_rating
            FROM transactions t
            LEFT JOIN customers c ON t.customer_id = c.customer_id
            LEFT JOIN cards cd ON t.card_id = cd.card_id
            LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
            WHERE t.transaction_id = :txn_id;
        """)
        row = db.execute(sql, {"txn_id": transaction_id.strip()}).mappings().first()
        if not row:
            return None
        return TransactionDetail(**dict(row))
