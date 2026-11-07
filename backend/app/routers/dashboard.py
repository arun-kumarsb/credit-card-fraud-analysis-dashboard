"""
SentinelShield - Dashboard Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import (
    DashboardOverviewResponse,
    DashboardTrendsResponse,
    DashboardDistributionsResponse
)
from backend.app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewResponse, summary="Executive Fraud Analytics Overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    return DashboardService.get_overview(db)

@router.get("/trends", response_model=DashboardTrendsResponse, summary="Temporal Trends & Anomaly Heatmap")
def get_dashboard_trends(db: Session = Depends(get_db)):
    return DashboardService.get_trends(db)

@router.get("/distributions", response_model=DashboardDistributionsResponse, summary="Pareto Fraud Vectors & Rails")
def get_dashboard_distributions(db: Session = Depends(get_db)):
    return DashboardService.get_distributions(db)
