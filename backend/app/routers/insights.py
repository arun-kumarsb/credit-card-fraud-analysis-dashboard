"""
SentinelShield - Gemini AI Chart Insights Router
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from backend.app.schemas.insight_schema import (
    ChartInsightRequest,
    ChartInsightResponse,
    ApiKeyConfigRequest,
    ApiKeyConfigResponse
)
from backend.app.services.gemini_service import (
    GeminiService,
    get_gemini_api_key,
    set_runtime_gemini_key
)

router = APIRouter(prefix="/api/insights", tags=["Gemini AI Forensic Insights"])

@router.post("/generate", response_model=ChartInsightResponse, summary="Generate Dynamic AI Forensic Insight for Chart")
async def generate_chart_insight(
    req: ChartInsightRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key")
):
    """
    Generates dynamic forensic insight for a specific chart and time period.
    Accepts summarized metrics (compact payload) and returns structured intelligence:
    - What the graph is used for (purpose)
    - What the graph delivers (output_delivered)
    - Data-driven observation for current period
    - Forensic risk vector
    - Recommended action
    """
    try:
        explicit_key = req.api_key or x_gemini_api_key
        insight = await GeminiService.generate_chart_insight(
            chart_id=req.chart_id,
            chart_title=req.chart_title,
            time_period=req.time_period,
            summary_metrics=req.summary_metrics,
            explicit_key=explicit_key
        )
        return insight
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insight: {str(e)}")

@router.get("/config", response_model=ApiKeyConfigResponse, summary="Check Gemini API Key Status")
def get_api_key_status():
    """Checks if a valid Gemini API key is currently configured."""
    key = get_gemini_api_key()
    if key:
        masked = key[:4] + "..." + key[-4:] if len(key) > 8 else "***"
        return ApiKeyConfigResponse(status="configured", has_api_key=True, masked_key=masked)
    return ApiKeyConfigResponse(status="not_configured", has_api_key=False, masked_key=None)

@router.post("/config", response_model=ApiKeyConfigResponse, summary="Configure Runtime Gemini API Key")
def set_api_key_config(req: ApiKeyConfigRequest):
    """Updates runtime Gemini API key for live generation."""
    set_runtime_gemini_key(req.api_key)
    key = req.api_key.strip()
    masked = key[:4] + "..." + key[-4:] if len(key) > 8 else "***"
    return ApiKeyConfigResponse(status="updated", has_api_key=True, masked_key=masked)
