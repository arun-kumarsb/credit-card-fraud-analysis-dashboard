"""
SentinelShield - Cards Router
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import CardAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/cards", tags=["Cards"])

@router.get("/analytics", response_model=CardAnalyticsResponse, summary="Cards Portfolio & Lifecycle Analytics")
def get_card_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_card_analytics(db, start_date=start_date, end_date=end_date)
