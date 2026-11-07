"""
SentinelShield - Merchants Router
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import MerchantAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/merchants", tags=["Merchants"])

@router.get("/analytics", response_model=MerchantAnalyticsResponse, summary="Merchant Ecosystem & Risk Matrix")
def get_merchant_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_merchant_analytics(db, start_date=start_date, end_date=end_date)
