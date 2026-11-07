import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  Receipt,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api, TransactionFilterParams } from '../services/api';
import {
  PaginatedTransactionsResponse,
  TransactionListItem,
  TransactionDetail,
  DashboardDistributionsResponse
} from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { TransactionDetailDrawer } from '../components/transactions/TransactionDetailDrawer';

interface TransactionsExplorerPageProps {
  initialSearch?: string;
}

export const TransactionsExplorerPage: React.FC<TransactionsExplorerPageProps> = ({
  initialSearch = ''
}) => {
  const [data, setData] = useState<PaginatedTransactionsResponse | null>(null);
  const [distributions, setDistributions] = useState<DashboardDistributionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Transaction for Drawer Detail
  const [selectedTxn, setSelectedTxn] = useState<TransactionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filter & Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState(initialSearch);
  const [fraudFlag, setFraudFlag] = useState<number>(-1); // -1: All, 1: Fraud, 0: Legit
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [status, setStatus] = useState('All');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState('transaction_datetime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: TransactionFilterParams = {
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        fraud_flag: fraudFlag !== -1 ? fraudFlag : undefined,
        category: category !== 'All' ? category : undefined,
        payment_method: paymentMethod !== 'All' ? paymentMethod : undefined,
        status: status !== 'All' ? status : undefined,
        min_amount: minAmount ? parseFloat(minAmount) : undefined,
        max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const [resTxn, resDist] = await Promise.all([
        api.getTransactions(params),
        distributions ? Promise.resolve(distributions) : api.getDistributions(),
      ]);

      setData(resTxn);
      if (!distributions) setDistributions(resDist);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction ledger stream');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, fraudFlag, category, paymentMethod, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setFraudFlag(-1);
    setCategory('All');
    setPaymentMethod('All');
    setStatus('All');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('transaction_datetime');
    setSortOrder('desc');
    setPage(1);
  };

  const handleRowClick = async (txnId: string) => {
    try {
      setLoadingDetail(true);
      const detail = await api.getTransactionById(txnId);
      setSelectedTxn(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const categoriesList = [
    'All', 'Hotel', 'Fashion', 'Fuel', 'Travel', 'Airline', 'Hospital', 
    'Ecommerce', 'Financial Services', 'Food Delivery', 'Entertainment', 
    'Pharmacy', 'Electronics', 'Education', 'Grocery', 'Utilities'
  ];

  const paymentRailsList = ['All', 'Debit Card', 'Credit Card', 'UPI', 'Net Banking'];
  const statusList = ['All', 'Successful', 'Declined', 'Failed'];

  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Filtered Summary Strip */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Matched Ledger Records"
            value={data.total.toLocaleString()}
            subtitle={`Page ${data.page} of ${data.total_pages.toLocaleString()}`}
            badge={{ text: 'Live Ledger', variant: 'primary' }}
            icon={<Receipt className="w-5 h-5 text-primary" />}
          />
          <KPICard
            title="Filtered Gross Amount"
            value={fmtCurrency(data.summary_of_filtered.filtered_total_amount)}
            subtitle="Aggregated subset value"
            badge={{ text: 'Capital Sum', variant: 'neutral' }}
          />
          <KPICard
            title="Flagged Fraud Events"
            value={data.summary_of_filtered.filtered_fraud_count.toLocaleString()}
            subtitle={`Fraud Rate: ${data.summary_of_filtered.filtered_fraud_rate_pct}%`}
            badge={{ text: 'Risk Events', variant: 'danger' }}
            icon={<AlertTriangle className="w-5 h-5 text-danger" />}
          />
          <KPICard
            title="Filtered Fraud Loss"
            value={fmtCurrency(data.summary_of_filtered.filtered_fraud_amount)}
            subtitle="Damage across current query"
            badge={{ text: 'Loss Sum', variant: 'danger' }}
          />
        </div>
      )}

      {/* Visual Analytics Row: Pareto Vectors & Payment Rail Breakdown */}
      {distributions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Fraud Vector Pareto Breakdown"
            subtitle="Incident frequency across 8 distinct attack vectors"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={distributions.fraud_vectors_pareto}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="Fraud_Reason"
                  tick={{ fontSize: 9, fill: '#0F172A' }}
                  width={140}
                  tickFormatter={(val) => (val.length > 20 ? `${val.substring(0, 20)}...` : val)}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} incidents`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="fraud_count" fill="#EF4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Payment Rail Distribution"
            subtitle="Volume and fraud incidents by payment rail"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distributions.payment_rails}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="Payment_Method" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    Number(val).toLocaleString(),
                    name === 'total_txns' ? 'Total Txns' : 'Fraud Events',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Bar dataKey="total_txns" name="Total Volume" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fraud_txns" name="Fraud Incidents" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Filter and Query Control Bar */}
      <div className="bg-surface rounded-2xl p-5 border border-slate-hairline shadow-ambient space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input
              type="text"
              placeholder="Search by Transaction ID (e.g. TXN1000001), Customer, Card, or Merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-hairline bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-heading placeholder:text-slate-muted transition"
            />
          </form>

          {/* Quick Segmented Toggle for Fraud Flag */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setFraudFlag(-1); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition ${fraudFlag === -1 ? 'bg-white text-slate-heading shadow-sm' : 'text-slate-muted hover:text-slate-heading'}`}
            >
              All Records
            </button>
            <button
              onClick={() => { setFraudFlag(1); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition ${fraudFlag === 1 ? 'bg-danger text-white shadow-sm' : 'text-danger hover:bg-danger/10'}`}
            >
              Fraud Only
            </button>
            <button
              onClick={() => { setFraudFlag(0); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition ${fraudFlag === 0 ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              Legitimate
            </button>
          </div>

          {/* Toggle Advanced Filters & Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition ${
                showAdvancedFilters ? 'bg-primary text-white border-primary' : 'bg-surface border-slate-hairline text-slate-body hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="p-2 text-xs rounded-xl border border-slate-hairline bg-surface text-slate-muted hover:text-slate-heading hover:bg-slate-50 transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <a
              href={api.exportTransactionsCsvUrl({
                search,
                fraud_flag: fraudFlag !== -1 ? fraudFlag : undefined,
                category,
                payment_method: paymentMethod,
                status,
              })}
              download
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-heading text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </a>
          </div>
        </div>

        {/* Collapsible Advanced Filter Controls */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-hairline grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-muted uppercase mb-1">Merchant Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-hairline bg-slate-50 text-slate-heading focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-muted uppercase mb-1">Payment Rail</label>
              <select
                value={paymentMethod}
                onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-hairline bg-slate-50 text-slate-heading focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {paymentRailsList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-muted uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-hairline bg-slate-50 text-slate-heading focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {statusList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-muted uppercase mb-1">Sort Attribute</label>
              <div className="flex gap-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-hairline bg-slate-50 text-slate-heading focus:outline-none"
                >
                  <option value="transaction_datetime">Date / Time</option>
                  <option value="transaction_amount">Amount</option>
                  <option value="fraud_flag">Fraud Status</option>
                  <option value="merchant_category">Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-lg border border-slate-hairline bg-slate-50 text-slate-heading hover:bg-slate-100"
                  title="Toggle Asc/Desc"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-surface rounded-2xl border border-slate-hairline shadow-ambient overflow-hidden">
        {loading && <div className="p-8 text-center text-xs text-slate-muted animate-pulse">Querying 250,000 ledger index...</div>}
        {error && <ErrorState message={error} onRetry={fetchTransactions} />}
        {!loading && !error && data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-hairline uppercase text-[10px] font-bold tracking-wider text-slate-muted">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Cardholder / Card</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Rail</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Fraud Status & Vector</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-hairline/60">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-muted">
                        No transactions found matching the applied filter criteria.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((txn) => {
                      const isFraud = txn.fraud_flag === 1;
                      return (
                        <tr
                          key={txn.transaction_id}
                          onClick={() => handleRowClick(txn.transaction_id)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                            isFraud ? 'bg-danger-light/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-heading">
                            {txn.transaction_id}
                          </td>
                          <td className="py-3 px-4 text-slate-muted">
                            <div className="text-slate-heading font-medium">{txn.transaction_date}</div>
                            <div className="text-[10px]">{txn.transaction_time}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-heading">{txn.customer_id}</div>
                            <div className="font-mono text-[10px] text-slate-muted">{txn.card_id}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-heading">
                            {txn.merchant_category}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-heading tabular-nums">
                            ${txn.transaction_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-slate-muted font-medium">
                            {txn.payment_method}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={txn.transaction_status} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <StatusBadge status={txn.fraud_flag} type="fraud" />
                              {isFraud && (
                                <span className="text-[10px] text-danger font-semibold max-w-[200px] truncate" title={txn.fraud_reason}>
                                  {txn.fraud_reason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(txn.transaction_id);
                              }}
                              className="p-1.5 rounded-lg text-slate-muted hover:text-primary hover:bg-slate-100 transition"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-hairline bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-muted">
              <div>
                Showing{' '}
                <span className="font-bold text-slate-heading tabular-nums">
                  {Math.min(data.total, (page - 1) * pageSize + 1)}–{Math.min(data.total, page * pageSize)}
                </span>{' '}
                of <span className="font-bold text-slate-heading tabular-nums">{data.total.toLocaleString()}</span> entries
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-hairline bg-surface text-slate-heading focus:outline-none"
                >
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    disabled={!data.has_prev}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-slate-hairline bg-surface text-slate-heading disabled:opacity-40 hover:bg-slate-100 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-bold text-slate-heading tabular-nums">
                    {page} / {data.total_pages.toLocaleString()}
                  </span>
                  <button
                    disabled={!data.has_next}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-slate-hairline bg-surface text-slate-heading disabled:opacity-40 hover:bg-slate-100 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Slide-out Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};
