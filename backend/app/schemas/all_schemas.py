"""
SentinelShield - Pydantic Response Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Dashboard Schemas ---
class OverviewKPIs(BaseModel):
    total_transactions: int
    total_volume_amount: float
    fraud_transactions: int
    fraud_volume_amount: float
    legit_transactions: int
    legit_volume_amount: float
    fraud_rate_pct: float
    fraud_value_rate_pct: float
    avg_transaction_amount: float
    avg_fraud_amount: float
    avg_legit_amount: float
    max_fraud_amount: float

class MonthlyTrendItem(BaseModel):
    Year_Month: str
    total_txns: int
    total_amount: float
    fraud_txns: int
    fraud_amount: float
    fraud_rate_pct: float

class TemporalHeatmapItem(BaseModel):
    Day_of_Week: str
    Hour: int
    total_txns: int
    fraud_txns: int
    total_amount: float
    fraud_amount: float
    fraud_rate_pct: float

class FraudReasonItem(BaseModel):
    Fraud_Reason: str
    fraud_count: int
    fraud_amount: float
    avg_amount: float
    pct_of_total_fraud: float

class CategoryRiskItem(BaseModel):
    Merchant_Category: str
    total_txns: int
    total_amount: float
    fraud_txns: int
    fraud_amount: float
    fraud_rate_pct: float

class StateRiskItem(BaseModel):
    Customer_State: str
    total_txns: int
    total_amount: float
    fraud_txns: int
    fraud_amount: float
    fraud_rate_pct: float

class DashboardOverviewResponse(BaseModel):
    kpis: OverviewKPIs
    fraud_loss_share: Dict[str, Any]
    customer_segments: List[Dict[str, Any]]
    top_categories: List[CategoryRiskItem]
    recent_flagged_samples: List[Dict[str, Any]]

class DashboardTrendsResponse(BaseModel):
    monthly_trends: List[MonthlyTrendItem]
    temporal_heatmap: List[TemporalHeatmapItem]

class DashboardDistributionsResponse(BaseModel):
    fraud_vectors_pareto: List[FraudReasonItem]
    payment_rails: List[Dict[str, Any]]
    state_density: List[StateRiskItem]
    amount_distribution: List[Dict[str, Any]]

# --- Transactions Schemas ---
class TransactionListItem(BaseModel):
    transaction_id: str
    customer_id: str
    card_id: str
    merchant_id: str
    transaction_date: str
    transaction_time: str
    transaction_datetime: str
    transaction_amount: float
    payment_method: str
    transaction_channel: str
    device_type: str
    transaction_status: str
    is_international: int
    fraud_flag: int
    fraud_reason: str
    merchant_risk_level: str
    merchant_category: str
    customer_state: str
    customer_city: str
    amount_to_limit_ratio: float

class TransactionDetail(TransactionListItem):
    merchant_state: str
    merchant_city: str
    year: int
    month: int
    year_month: str
    day_of_week: str
    hour: int
    time_period: str
    is_night: int
    is_weekend: int
    card_credit_limit: int
    is_high_value: int
    customer_name: Optional[str] = None
    customer_occupation: Optional[str] = None
    customer_segment: Optional[str] = None
    card_network: Optional[str] = None
    card_type: Optional[str] = None
    card_status: Optional[str] = None
    merchant_name: Optional[str] = None
    merchant_rating: Optional[float] = None

class PaginatedTransactionsResponse(BaseModel):
    items: List[TransactionListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
    summary_of_filtered: Dict[str, Any]

# --- Analytics Schemas ---
class CustomerAnalyticsResponse(BaseModel):
    total_customers: int
    avg_annual_income: float
    segment_distribution: List[Dict[str, Any]]
    age_cohort_risk: List[Dict[str, Any]]
    income_tier_risk: List[Dict[str, Any]]
    occupation_risk: List[Dict[str, Any]]
    account_type_matrix: List[Dict[str, Any]]
    marital_status_risk: List[Dict[str, Any]]

class CardAnalyticsResponse(BaseModel):
    total_cards: int
    avg_credit_limit: float
    total_credit_limit_exposure: float
    network_distribution: List[Dict[str, Any]]
    card_type_distribution: List[Dict[str, Any]]
    operational_status_distribution: List[Dict[str, Any]]
    form_factor_distribution: List[Dict[str, Any]]
    contactless_share: List[Dict[str, Any]]
    limit_tier_risk: List[Dict[str, Any]]

class MerchantAnalyticsResponse(BaseModel):
    total_merchants: int
    risk_level_distribution: List[Dict[str, Any]]
    category_risk_comparison: List[Dict[str, Any]]
    top_watchlist: List[Dict[str, Any]]
    rating_vs_fraud: List[Dict[str, Any]]

# --- Data Quality Schema ---
class DataQualityResponse(BaseModel):
    project: str
    pipeline_run_timestamp: str
    execution_duration_seconds: float
    status: str
    summary: Dict[str, Any]
    datasets: Dict[str, Any]
