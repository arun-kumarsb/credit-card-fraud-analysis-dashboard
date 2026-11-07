"""
SentinelShield - Dashboard Router
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
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
def get_dashboard_overview(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    return DashboardService.get_overview(db, start_date=start_date, end_date=end_date)

@router.get("/trends", response_model=DashboardTrendsResponse, summary="Temporal Trends & Anomaly Heatmap")
def get_dashboard_trends(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    return DashboardService.get_trends(db, start_date=start_date, end_date=end_date)

@router.get("/distributions", response_model=DashboardDistributionsResponse, summary="Pareto Fraud Vectors & Rails")
def get_dashboard_distributions(
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    return DashboardService.get_distributions(db, start_date=start_date, end_date=end_date)
