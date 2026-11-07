import {
  DashboardOverviewResponse,
  DashboardTrendsResponse,
  DashboardDistributionsResponse,
  PaginatedTransactionsResponse,
  TransactionDetail,
  CustomerAnalyticsResponse,
  CardAnalyticsResponse,
  MerchantAnalyticsResponse,
  DataQualityResponse
} from '../types/api';

const API_BASE = '/api';

export interface TransactionFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  fraud_flag?: number;
  category?: string;
  payment_method?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: string;
  sort_order?: string;
}

export const api = {
  // Dashboard Endpoints
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    const res = await fetch(`${API_BASE}/dashboard/overview`);
    if (!res.ok) throw new Error(`Failed to load overview: ${res.statusText}`);
    return res.json();
  },

  getTrends: async (): Promise<DashboardTrendsResponse> => {
    const res = await fetch(`${API_BASE}/dashboard/trends`);
    if (!res.ok) throw new Error(`Failed to load trends: ${res.statusText}`);
    return res.json();
  },

  getDistributions: async (): Promise<DashboardDistributionsResponse> => {
    const res = await fetch(`${API_BASE}/dashboard/distributions`);
    if (!res.ok) throw new Error(`Failed to load distributions: ${res.statusText}`);
    return res.json();
  },

  // Transactions Endpoints
  getTransactions: async (params: TransactionFilterParams = {}): Promise<PaginatedTransactionsResponse> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.page_size !== undefined) query.set('page_size', params.page_size.toString());
    if (params.search) query.set('search', params.search);
    if (params.fraud_flag !== undefined && params.fraud_flag !== -1) query.set('fraud_flag', params.fraud_flag.toString());
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.payment_method && params.payment_method !== 'All') query.set('payment_method', params.payment_method);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.date_from) query.set('date_from', params.date_from);
    if (params.date_to) query.set('date_to', params.date_to);
    if (params.min_amount !== undefined) query.set('min_amount', params.min_amount.toString());
    if (params.max_amount !== undefined) query.set('max_amount', params.max_amount.toString());
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to load transactions: ${res.statusText}`);
    return res.json();
  },

  getTransactionById: async (id: string): Promise<TransactionDetail> => {
    const res = await fetch(`${API_BASE}/transactions/${id}`);
    if (!res.ok) throw new Error(`Transaction ${id} not found`);
    return res.json();
  },

  exportTransactionsCsvUrl: (params: TransactionFilterParams = {}): string => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.fraud_flag !== undefined && params.fraud_flag !== -1) query.set('fraud_flag', params.fraud_flag.toString());
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.payment_method && params.payment_method !== 'All') query.set('payment_method', params.payment_method);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.date_from) query.set('date_from', params.date_from);
    if (params.date_to) query.set('date_to', params.date_to);
    if (params.min_amount !== undefined) query.set('min_amount', params.min_amount.toString());
    if (params.max_amount !== undefined) query.set('max_amount', params.max_amount.toString());
    query.set('limit', '5000');
    return `${API_BASE}/transactions/export/csv?${query.toString()}`;
  },

  // Analytics Endpoints
  getCustomerAnalytics: async (): Promise<CustomerAnalyticsResponse> => {
    const res = await fetch(`${API_BASE}/customers/analytics`);
    if (!res.ok) throw new Error(`Failed to load customer analytics: ${res.statusText}`);
    return res.json();
  },

  getCardAnalytics: async (): Promise<CardAnalyticsResponse> => {
    const res = await fetch(`${API_BASE}/cards/analytics`);
    if (!res.ok) throw new Error(`Failed to load card analytics: ${res.statusText}`);
    return res.json();
  },

  getMerchantAnalytics: async (): Promise<MerchantAnalyticsResponse> => {
    const res = await fetch(`${API_BASE}/merchants/analytics`);
    if (!res.ok) throw new Error(`Failed to load merchant analytics: ${res.statusText}`);
    return res.json();
  },

  // Data Quality Endpoint
  getDataQuality: async (): Promise<DataQualityResponse> => {
    const res = await fetch(`${API_BASE}/data-quality`);
    if (!res.ok) throw new Error(`Failed to load data quality: ${res.statusText}`);
    return res.json();
  }
};
