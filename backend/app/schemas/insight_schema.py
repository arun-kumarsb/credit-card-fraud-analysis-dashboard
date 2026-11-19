"""
SentinelShield - Pydantic Schemas for Gemini AI Chart Insights
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class ChartInsightRequest(BaseModel):
    chart_id: str = Field(..., description="Unique chart identifier, e.g. macro_volume_trend")
    chart_title: str = Field(..., description="Human-readable title of the chart")
    time_period: str = Field(..., description="Active date range / filter label, e.g. Year 2024 (Jan - Dec)")
    summary_metrics: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Compact summarized metrics (5-8 data points) to avoid large payload to Gemini"
    )
    api_key: Optional[str] = Field(None, description="Optional Gemini API key override")

class ChartInsightResponse(BaseModel):
    chart_id: str
    chart_title: str
    time_period: str
    purpose: str = Field(..., description="What this graph is used for")
    output_delivered: str = Field(..., description="What this graph delivers as an output")
    observation: str = Field(..., description="Dynamic analytical finding from current period data")
    risk_vector: str = Field(..., description="Forensic risk vector or attack signature highlighted")
    recommended_action: str = Field(..., description="Actionable operational countermeasure for risk officers")
    source: str = Field("gemini-1.5-flash", description="Generation engine used: gemini-1.5-flash or gemini-ai-synthesis")

class ApiKeyConfigRequest(BaseModel):
    api_key: str

class ApiKeyConfigResponse(BaseModel):
    status: str
    has_api_key: bool
    masked_key: Optional[str] = None
