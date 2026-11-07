import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DollarSign,
  AlertTriangle,
  Activity,
  CreditCard,
  ShieldAlert,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import {
  DashboardOverviewResponse,
  DashboardTrendsResponse
} from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';

export const ExecutiveOverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [trends, setTrends] = useState<DashboardTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ovData, trData] = await Promise.all([
        api.getOverview(),
        api.getTrends(),
      ]);
      setOverview(ovData);
      setTrends(trData);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!overview || !trends) return null;

  const { kpis, fraud_loss_share, customer_segments, top_categories } = overview;

  // Donut data for Loss Share
  const lossDonutData = [
    { name: 'Legitimate Volume', value: fraud_loss_share.legit_volume_amount, pct: fraud_loss_share.legit_volume_pct, color: '#10B981' },
    { name: 'Fraud Loss', value: fraud_loss_share.fraud_loss_amount, pct: fraud_loss_share.fraud_volume_pct, color: '#EF4444' }
  ];

  // Format currency helpers
  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Transaction Volume"
          value={fmtCurrency(kpis.total_volume_amount)}
          subtitle="250,000 Verified Transactions"
          badge={{ text: '2023 - 2026', variant: 'primary' }}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <KPICard
          title="Total Fraud Loss"
          value={fmtCurrency(kpis.fraud_volume_amount)}
          subtitle="25.34% of Gross Value"
          badge={{ text: 'High Impact', variant: 'danger' }}
          icon={<AlertTriangle className="w-5 h-5 text-danger" />}
        />
        <KPICard
          title="Fraud Incident Rate"
          value={`${kpis.fraud_rate_pct}%`}
          subtitle={`${kpis.fraud_transactions.toLocaleString()} Flagged Events`}
          badge={{ text: 'Attack Density', variant: 'warning' }}
          icon={<Activity className="w-5 h-5 text-warning" />}
        />
        <KPICard
          title="Avg Fraud Amount"
          value={`$${kpis.avg_fraud_amount.toLocaleString()}`}
          subtitle={`6× Higher than Legit ($${kpis.avg_legit_amount.toLocaleString()})`}
          badge={{ text: 'Outlier Severity', variant: 'danger' }}
          icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Primary Analytics Grid: 3-Year Trend & Loss Share Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3-Year Trend Line Chart (spans 2 columns) */}
        <ChartCard
          title="3-Year Gross Volume vs. Fraud Loss"
          subtitle="Monthly financial progression across 2023–2026 (in Millions USD)"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends.monthly_trends}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="Year_Month" tick={{ fontSize: 10, fill: '#64748B' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `$${Number(val).toLocaleString()}`,
                  name === 'total_amount' ? 'Gross Volume' : 'Fraud Loss',
                ]}
                labelFormatter={(lbl) => `Month: ${lbl}`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="total_amount" name="Gross Volume" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" />
              <Area type="monotone" dataKey="fraud_amount" name="Fraud Loss" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#fraudGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fraud Loss Share Donut */}
        <ChartCard
          title="Overall Fraud Loss Share"
          subtitle="Financial damage vs transaction event ratio"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={lossDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {lossDonutData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full space-y-2 mt-2 px-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-hairline">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-heading">Legitimate ({fraud_loss_share.legit_volume_pct}%)</span>
                </div>
                <span className="font-bold text-slate-heading tabular-nums">{fmtCurrency(fraud_loss_share.legit_volume_amount)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-danger-light border border-danger/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-danger"></span>
                  <span className="font-bold text-danger-dark">Fraud Loss ({fraud_loss_share.fraud_volume_pct}%)</span>
                </div>
                <span className="font-bold text-danger-dark tabular-nums">{fmtCurrency(fraud_loss_share.fraud_loss_amount)}</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Secondary Analytics Grid: Customer Segment Exposure & Top Category Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segment Exposure */}
        <ChartCard
          title="Customer Segment Exposure"
          subtitle="Total volume and fraud losses across tiers (Platinum, Gold, Standard, Basic)"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={customer_segments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="Customer_Segment" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `$${Number(val).toLocaleString()}`,
                  name === 'total_amount' ? 'Total Volume' : 'Fraud Loss',
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="total_amount" name="Total Volume" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="fraud_amount" name="Fraud Loss" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top At-Risk Merchant Categories */}
        <ChartCard
          title="Top 8 Targeted Merchant Categories"
          subtitle="Ranked by total financial fraud loss (in Millions USD)"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={top_categories}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <YAxis type="category" dataKey="Merchant_Category" tick={{ fontSize: 10, fill: '#0F172A' }} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Fraud Loss']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="fraud_amount" name="Fraud Loss" fill="#BA1A1A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Forensic Intelligence Highlights */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-hairline shadow-ambient">
        <h4 className="text-base font-bold text-slate-heading mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-danger" />
          Empirical Data Visualizations & Statistical Observations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-body">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
            <span className="font-bold text-slate-heading block mb-1">Financial Damage Asymmetry</span>
            Fraud represents only <strong>5.39%</strong> of transaction counts but accounts for <strong>25.34% ($1.05 Billion)</strong> of total capital lost. High-limit transactions drive outsized risk exposure.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
            <span className="font-bold text-slate-heading block mb-1">Temporal Attack Clustering</span>
            Fraud incident density spikes significantly during late-night and pre-dawn hours (<strong>00:00 to 05:00</strong>), exceeding a <strong>12% incident rate</strong> compared to 3.8% daytime baseline.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
            <span className="font-bold text-slate-heading block mb-1">Category Concentration</span>
            High-velocity sectors such as <strong>Hotels, Fashion, Fuel, and Travel</strong> represent the top target vectors, accumulating over <strong>$500M</strong> in combined fraud loss.
          </div>
        </div>
      </div>
    </div>
  );
};
