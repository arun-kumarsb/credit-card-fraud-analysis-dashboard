"""
SentinelShield - Customers Router
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import CustomerAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/analytics", response_model=CustomerAnalyticsResponse, summary="Customer Demographics & Portfolio Risk")
def get_customer_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_customer_analytics(db, start_date=start_date, end_date=end_date)
