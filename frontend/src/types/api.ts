export interface OverviewKPIs {
  total_transactions: number;
  total_volume_amount: number;
  fraud_transactions: number;
  fraud_volume_amount: number;
  legit_transactions: number;
  legit_volume_amount: number;
  fraud_rate_pct: number;
  fraud_value_rate_pct: number;
  avg_transaction_amount: number;
  avg_fraud_amount: number;
  avg_legit_amount: number;
  max_fraud_amount: number;
}

export interface DashboardOverviewResponse {
  kpis: OverviewKPIs;
  fraud_loss_share: {
    fraud_volume_pct: number;
    legit_volume_pct: number;
    fraud_count_pct: number;
    legit_count_pct: number;
    fraud_loss_amount: number;
    legit_volume_amount: number;
  };
  customer_segments: Array<{
    Customer_Segment: string;
    total_txns: number;
    total_amount: number;
    fraud_txns: number;
    fraud_amount: number;
    fraud_rate_pct: number;
  }>;
  top_categories: Array<{
    Merchant_Category: string;
    total_txns: number;
    total_amount: number;
    fraud_txns: number;
    fraud_amount: number;
    fraud_rate_pct: number;
  }>;
  recent_flagged_samples: Array<{
    transaction_id: string;
    transaction_date: string;
    transaction_time: string;
    transaction_amount: number;
    fraud_reason: string;
    merchant_category: string;
    payment_method: string;
    customer_city: string;
  }>;
}

export interface MonthlyTrendItem {
  Year_Month: string;
  total_txns: number;
  total_amount: number;
  fraud_txns: number;
  fraud_amount: number;
  fraud_rate_pct: number;
}

export interface TemporalHeatmapItem {
  Day_of_Week: string;
  Hour: number;
  total_txns: number;
  fraud_txns: number;
  total_amount: number;
  fraud_amount: number;
  fraud_rate_pct: number;
}

export interface DashboardTrendsResponse {
  monthly_trends: MonthlyTrendItem[];
  temporal_heatmap: TemporalHeatmapItem[];
}

export interface FraudReasonItem {
  Fraud_Reason: string;
  fraud_count: number;
  fraud_amount: number;
  avg_amount: number;
  pct_of_total_fraud: number;
}

export interface StateRiskItem {
  Customer_State: string;
  total_txns: number;
  total_amount: number;
  fraud_txns: number;
  fraud_amount: number;
  fraud_rate_pct: number;
}

export interface DashboardDistributionsResponse {
  fraud_vectors_pareto: FraudReasonItem[];
  payment_rails: Array<{
    Payment_Method: string;
    total_txns: number;
    total_amount: number;
    fraud_txns: number;
    fraud_amount: number;
    fraud_rate_pct: number;
  }>;
  state_density: StateRiskItem[];
  amount_distribution: Array<{
    tier: string;
    count: number;
    fraud_count: number;
    fraud_rate_pct: number;
  }>;
}

export interface TransactionListItem {
  transaction_id: string;
  customer_id: string;
  card_id: string;
  merchant_id: string;
  transaction_date: string;
  transaction_time: string;
  transaction_datetime: string;
  transaction_amount: number;
  payment_method: string;
  transaction_channel: string;
  device_type: string;
  transaction_status: string;
  is_international: number;
  fraud_flag: number;
  fraud_reason: string;
  merchant_risk_level: string;
  merchant_category: string;
  customer_state: string;
  customer_city: string;
  amount_to_limit_ratio: number;
}

export interface TransactionDetail extends TransactionListItem {
  merchant_state: string;
  merchant_city: string;
  year: number;
  month: number;
  year_month: string;
  day_of_week: string;
  hour: number;
  time_period: string;
  is_night: number;
  is_weekend: number;
  card_credit_limit: number;
  is_high_value: number;
  customer_name?: string;
  customer_occupation?: string;
  customer_segment?: string;
  card_network?: string;
  card_type?: string;
  card_status?: string;
  merchant_name?: string;
  merchant_rating?: number;
}

export interface PaginatedTransactionsResponse {
  items: TransactionListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  summary_of_filtered: {
    filtered_total_count: number;
    filtered_total_amount: number;
    filtered_fraud_count: number;
    filtered_fraud_amount: number;
    filtered_fraud_rate_pct: number;
  };
}

export interface CustomerAnalyticsResponse {
  total_customers: number;
  avg_annual_income: number;
  segment_distribution: any[];
  age_cohort_risk: any[];
  income_tier_risk: any[];
  occupation_risk: any[];
  account_type_matrix: any[];
  marital_status_risk: any[];
}

export interface CardAnalyticsResponse {
  total_cards: number;
  avg_credit_limit: number;
  total_credit_limit_exposure: number;
  network_distribution: any[];
  card_type_distribution: any[];
  operational_status_distribution: any[];
  form_factor_distribution: any[];
  contactless_share: any[];
  limit_tier_risk: any[];
}

export interface MerchantAnalyticsResponse {
  total_merchants: number;
  risk_level_distribution: any[];
  category_risk_comparison: any[];
  top_watchlist: any[];
  rating_vs_fraud: any[];
}

export interface DataQualityResponse {
  project: string;
  pipeline_run_timestamp: string;
  execution_duration_seconds: number;
  status: string;
  summary: {
    total_transactions: number;
    total_cards: number;
    total_customers: number;
    total_merchants: number;
    total_records_removed: number;
    referential_integrity_status: string;
  };
  datasets: Record<string, any>;
}
