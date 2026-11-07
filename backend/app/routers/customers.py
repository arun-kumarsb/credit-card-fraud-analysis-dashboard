"""
SentinelShield - Customers Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import CustomerAnalyticsResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/analytics", response_model=CustomerAnalyticsResponse, summary="Customer Demographics & Portfolio Risk")
def get_customer_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_customer_analytics(db)
