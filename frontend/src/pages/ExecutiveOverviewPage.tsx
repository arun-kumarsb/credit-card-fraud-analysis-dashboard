import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import {
  DashboardOverviewResponse,
  DashboardTrendsResponse,
  DashboardDistributionsResponse
} from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { SemicircularGauge } from '../components/dashboard/SemicircularGauge';
import { MacroVolumeTrendChart } from '../components/dashboard/MacroVolumeTrendChart';
import { TemporalAnomalyHeatmap } from '../components/dashboard/TemporalAnomalyHeatmap';
import { CustomerSegmentDonut } from '../components/dashboard/CustomerSegmentDonut';
import { StateFraudDensity } from '../components/dashboard/StateFraudDensity';
import { ContextualAlerts } from '../components/dashboard/ContextualAlerts';

interface ExecutiveOverviewPageProps {
  startDate?: string;
  endDate?: string;
  currencyPrefix?: string;
}

export const ExecutiveOverviewPage: React.FC<ExecutiveOverviewPageProps> = ({
  startDate,
  endDate,
  currencyPrefix = '$'
}) => {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [trends, setTrends] = useState<DashboardTrendsResponse | null>(null);
  const [distributions, setDistributions] = useState<DashboardDistributionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ovData, trData, distData] = await Promise.all([
        api.getOverview(startDate, endDate),
        api.getTrends(startDate, endDate),
        api.getDistributions(startDate, endDate),
      ]);
      setOverview(ovData);
      setTrends(trData);
      setDistributions(distData);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!overview || !trends || !distributions) return null;

  const { kpis, fraud_loss_share, customer_segments, top_categories } = overview;

  // Dynamic Insights Calculation directly from genuine API payloads
  const topCat = top_categories && top_categories.length > 0 ? top_categories[0] : null;
  const topSeg = customer_segments && customer_segments.length > 0
    ? [...customer_segments].sort((a, b) => b.fraud_amount - a.fraud_amount)[0]
    : null;
  const topSegLossPct = topSeg && fraud_loss_share.fraud_loss_amount > 0
    ? (topSeg.fraud_amount / fraud_loss_share.fraud_loss_amount) * 100
    : 0;

  // Calculate dynamic top states concentration
  const states = distributions.state_density || [];
  const top5StatesLoss = states.length > 0
    ? [...states].sort((a, b) => b.fraud_rate_pct - a.fraud_rate_pct).slice(0, 5).reduce((s, x) => s + x.fraud_amount, 0)
    : 0;
  const totalStateLoss = states.reduce((s, x) => s + x.fraud_amount, 0);
  const topStatesConcentration = totalStateLoss > 0 ? (top5StatesLoss / totalStateLoss) * 100 : 0;

  // Currency Formatter
  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `${currencyPrefix}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${currencyPrefix}${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `${currencyPrefix}${(val / 1e3).toFixed(1)}k`;
    return `${currencyPrefix}${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Active Filter Scope Tag (if filtered) */}
      {(startDate || endDate) && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">Filtered Analysis Window:</span>
            <span className="font-mono">{startDate || 'Start'} to {endDate || 'End'}</span>
          </div>
          <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded-full border border-primary/30">
            {kpis.total_transactions.toLocaleString()} Filtered Txns
          </span>
        </div>
      )}

      {/* 1. TOP 4 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Transaction Volume"
          value={fmtCurrency(kpis.total_volume_amount)}
          subtitle={`${kpis.total_transactions.toLocaleString()} Verified Transactions`}
          badge={{ text: startDate || endDate ? 'Filtered' : '2023 - 2026', variant: 'primary' }}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <KPICard
          title="Total Fraud Loss"
          value={fmtCurrency(kpis.fraud_volume_amount)}
          subtitle={`${kpis.fraud_value_rate_pct.toFixed(2)}% of Gross Value`}
          badge={{ text: 'High Impact', variant: 'danger' }}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
        />
        <KPICard
          title="Fraud Incident Rate"
          value={`${kpis.fraud_rate_pct.toFixed(2)}%`}
          subtitle={`${kpis.fraud_transactions.toLocaleString()} Flagged Events`}
          badge={{ text: 'Attack Density', variant: 'warning' }}
          icon={<Activity className="w-5 h-5 text-amber-500" />}
        />
        <KPICard
          title="Avg Fraud Amount"
          value={fmtCurrency(kpis.avg_fraud_amount)}
          subtitle={`6× Higher than Legit (${fmtCurrency(kpis.avg_legit_amount)})`}
          badge={{ text: 'Outlier Severity', variant: 'danger' }}
          icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* 2. PRIMARY ROW: 3-YEAR TREND & SEMICIRCULAR OVERALL FRAUD LOSS GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* 3-Year Gross Volume vs Fraud Loss Spline Chart from Stitch Reference (spans 2 columns) */}
        <div className="lg:col-span-2">
          <MacroVolumeTrendChart
            monthlyData={trends.monthly_trends}
            totalGross={kpis.total_volume_amount}
            totalFraud={kpis.fraud_volume_amount}
            currencyPrefix={currencyPrefix}
          />
        </div>

        {/* Semicircular Overall Fraud Loss Gauge (spans 1 column) */}
        <div>
          <SemicircularGauge
            fraudPct={fraud_loss_share.fraud_volume_pct}
            legitPct={fraud_loss_share.legit_volume_pct}
            fraudAmount={fraud_loss_share.fraud_loss_amount}
            legitAmount={fraud_loss_share.legit_volume_amount}
            fraudIncidents={kpis.fraud_transactions}
            totalTransactions={kpis.total_transactions}
            currencyPrefix={currencyPrefix}
          />
        </div>
      </div>

      {/* 3. MISSING STITCH VISUALIZATIONS ROW (3 EQUAL COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Temporal Anomaly Matrix (Heatmap) */}
        <TemporalAnomalyHeatmap data={trends.temporal_heatmap} />

        {/* Card 2: Customer Segment Exposure Donut */}
        <CustomerSegmentDonut
          segments={customer_segments}
          currencyPrefix={currencyPrefix}
        />

        {/* Card 3: State Fraud Density (India Matrix & Top 5 States) */}
        <StateFraudDensity
          states={distributions.state_density}
          currencyPrefix={currencyPrefix}
        />
      </div>

      {/* 4. DEEP-DIVE PORTFOLIO DISTRIBUTIONS (2 EQUAL COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grouped Bar Chart: Customer Segment Volume vs Loss */}
        <ChartCard
          title="Customer Segment Volume vs. Loss Comparison"
          subtitle="Total volume and net fraud losses across portfolio tiers"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={customer_segments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="Customer_Segment" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => fmtCurrency(v)} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  fmtCurrency(Number(val)),
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

        {/* Horizontal Bar Chart: Top 8 Targeted Merchant Categories */}
        <ChartCard
          title="Top 8 Targeted Merchant Categories"
          subtitle="Ranked by total financial fraud loss across MCC clusters"
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={top_categories}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => fmtCurrency(v)} />
              <YAxis type="category" dataKey="Merchant_Category" tick={{ fontSize: 10, fill: '#0F172A' }} />
              <Tooltip
                formatter={(val: any) => [fmtCurrency(Number(val)), 'Fraud Loss']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="fraud_amount" name="Fraud Loss" fill="#BA1A1A" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 5. CONTEXTUAL ANALYTICAL ALERTS */}
      <ContextualAlerts
        fraudLossAmount={fraud_loss_share.fraud_loss_amount}
        fraudLossPct={fraud_loss_share.fraud_volume_pct}
        topCategoryName={topCat?.Merchant_Category}
        topCategoryLoss={topCat?.fraud_amount}
        topSegmentName={topSeg?.Customer_Segment}
        topSegmentLossPct={topSegLossPct}
        topStatesConcentrationPct={topStatesConcentration}
        currencyPrefix={currencyPrefix}
      />
    </div>
  );
};
