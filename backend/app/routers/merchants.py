"""
SentinelShield - Merchants Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import MerchantAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/merchants", tags=["Merchants"])

@router.get("/analytics", response_model=MerchantAnalyticsResponse, summary="Merchant Ecosystem & Risk Matrix")
def get_merchant_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_merchant_analytics(db)
