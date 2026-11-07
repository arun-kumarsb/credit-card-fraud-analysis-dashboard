"""
SentinelShield - Cards Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import CardAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/cards", tags=["Cards"])

@router.get("/analytics", response_model=CardAnalyticsResponse, summary="Cards Portfolio & Lifecycle Analytics")
def get_card_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_card_analytics(db)
