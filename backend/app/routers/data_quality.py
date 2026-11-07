"""
SentinelShield - Data Quality Router
"""

from fastapi import APIRouter
from backend.app.schemas import DataQualityResponse
from backend.app.services.data_quality_service import DataQualityService

router = APIRouter(prefix="/api/data-quality", tags=["Data Quality"])

@router.get("", response_model=DataQualityResponse, summary="Pipeline Data Quality Audit Report")
def get_data_quality():
    return DataQualityService.get_quality_report()
