"""
SentinelShield - Transactions Router
"""

import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import (
    PaginatedTransactionsResponse,
    TransactionDetail
)
from backend.app.services.transaction_service import TransactionService

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=PaginatedTransactionsResponse, summary="Paginated & Filterable Transaction Ledger")
def get_transactions(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by Transaction, Customer, Card, or Merchant ID"),
    fraud_flag: Optional[int] = Query(None, description="Filter: 1 for Fraud, 0 for Legitimate"),
    category: Optional[str] = Query(None, description="Filter by Merchant Category"),
    payment_method: Optional[str] = Query(None, description="Filter by Payment Method"),
    status: Optional[str] = Query(None, description="Filter by Transaction Status (Successful/Declined/Failed)"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    min_amount: Optional[float] = Query(None, description="Minimum Transaction Amount"),
    max_amount: Optional[float] = Query(None, description="Maximum Transaction Amount"),
    sort_by: str = Query("transaction_datetime", description="Sort column"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    return TransactionService.get_transactions(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        fraud_flag=fraud_flag,
        category=category,
        payment_method=payment_method,
        status=status,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/export/csv", summary="Export Filtered Transactions to CSV")
def export_transactions_csv(
    search: Optional[str] = Query(None),
    fraud_flag: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    limit: int = Query(5000, le=25000, description="Max rows to stream"),
    db: Session = Depends(get_db)
):
    result = TransactionService.get_transactions(
        db=db,
        page=1,
        page_size=limit,
        search=search,
        fraud_flag=fraud_flag,
        category=category,
        payment_method=payment_method,
        status=status,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction_ID", "Date", "Time", "Customer_ID", "Card_ID", "Merchant_ID",
        "Category", "Amount", "Payment_Method", "Status", "Fraud_Flag", "Fraud_Reason"
    ])

    for item in result.items:
        writer.writerow([
            item.transaction_id, item.transaction_date, item.transaction_time,
            item.customer_id, item.card_id, item.merchant_id,
            item.merchant_category, item.transaction_amount, item.payment_method,
            item.transaction_status, item.fraud_flag, item.fraud_reason
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinelshield_transactions.csv"}
    )

@router.get("/{transaction_id}", response_model=TransactionDetail, summary="Single Transaction Detail with Linked Entities")
def get_transaction_detail(transaction_id: str, db: Session = Depends(get_db)):
    detail = TransactionService.get_transaction_by_id(db, transaction_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Transaction '{transaction_id}' not found")
    return detail
