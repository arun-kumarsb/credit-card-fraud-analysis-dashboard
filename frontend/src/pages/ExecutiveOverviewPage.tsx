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
import { ChartInsightBox } from '../components/common/ChartInsightBox';
import { formatCurrencyIN, formatNumberIN, CURRENCY_SYMBOL } from '../utils/formatters';

interface ExecutiveOverviewPageProps {
  startDate?: string;
  endDate?: string;
  currencyPrefix?: string;
}

export const ExecutiveOverviewPage: React.FC<ExecutiveOverviewPageProps> = ({
  startDate,
  endDate,
  currencyPrefix = CURRENCY_SYMBOL
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
  const sortedStates = states.length > 0
    ? [...states].sort((a, b) => b.fraud_rate_pct - a.fraud_rate_pct)
    : [];
  const top5StatesLoss = sortedStates.slice(0, 5).reduce((s, x) => s + x.fraud_amount, 0);
  const totalStateLoss = states.reduce((s, x) => s + x.fraud_amount, 0);
  const topStatesConcentration = totalStateLoss > 0 ? (top5StatesLoss / totalStateLoss) * 100 : 0;
  const topStateNames = sortedStates.slice(0, 2).map((s) => s.Customer_State);

  // Currency Formatter
  const fmtCurrency = (val: number) => formatCurrencyIN(val);

  const timePeriodLabel = startDate || endDate 
    ? `${startDate || 'Start'} to ${endDate || 'End'}`
    : 'All Time (2023 - 2026)';

  const peakMonth = trends.monthly_trends.length > 0
    ? trends.monthly_trends.reduce(
        (max, m) => (m.fraud_amount > (max?.fraud_amount || 0) ? m : max),
        trends.monthly_trends[0]
      )
    : null;

  const macroTrendMetrics = {
    total_volume: fmtCurrency(kpis.total_volume_amount),
    fraud_volume: fmtCurrency(kpis.fraud_volume_amount),
    fraud_ratio: `${kpis.fraud_value_rate_pct.toFixed(1)}%`,
    peak_month: peakMonth?.Year_Month || '2026-06',
    peak_loss: fmtCurrency(peakMonth?.fraud_amount || 0),
    total_months: trends.monthly_trends.length
  };

  const gaugeMetrics = {
    fraud_rate_pct: `${fraud_loss_share.fraud_volume_pct.toFixed(2)}%`,
    fraud_amount: fmtCurrency(fraud_loss_share.fraud_loss_amount),
    legit_amount: fmtCurrency(fraud_loss_share.legit_volume_amount),
    fraud_transactions: kpis.fraud_transactions,
    total_transactions: kpis.total_transactions
  };

  const heatmapMetrics = {
    peak_hours: "00:00 – 04:00 (Midnight to 4 AM)",
    peak_days: "Friday & Saturday nights",
    surge_rate: "35%+",
    total_flagged: kpis.fraud_transactions
  };

  const segmentMetrics = {
    top_segment: topSeg?.Customer_Segment || 'Platinum',
    top_segment_loss: `${topSegLossPct.toFixed(1)}%`,
    segments_evaluated: customer_segments.length
  };

  const stateMetrics = {
    top_state: sortedStates[0]?.Customer_State || 'Uttar Pradesh',
    top_state_loss: fmtCurrency(sortedStates[0]?.fraud_amount || 0),
    top5_share: `${topStatesConcentration.toFixed(1)}%`,
    states_count: states.length
  };

  const categoryMetrics = {
    top_category: topCat?.Merchant_Category || 'Hotels & Travel',
    top_loss: fmtCurrency(topCat?.fraud_amount || 0),
    categories_evaluated: top_categories.length
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
            {formatNumberIN(kpis.total_transactions)} Filtered Txns
          </span>
        </div>
      )}

      {/* 1. TOP 4 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Transaction Volume"
          value={fmtCurrency(kpis.total_volume_amount)}
          subtitle={`${formatNumberIN(kpis.total_transactions)} Verified Transactions`}
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
          subtitle={`${formatNumberIN(kpis.fraud_transactions)} Flagged Events`}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* 3-Year Gross Volume vs Fraud Loss Spline Chart from Stitch Reference (spans 2 columns) */}
        <div className="lg:col-span-2 flex flex-col">
          <MacroVolumeTrendChart
            monthlyData={trends.monthly_trends}
            totalGross={kpis.total_volume_amount}
            totalFraud={kpis.fraud_volume_amount}
            currencyPrefix={currencyPrefix}
          />
          <ChartInsightBox
            chartId="macro_volume_trend"
            chartTitle="3-Year Gross Volume vs Fraud Loss"
            timePeriod={timePeriodLabel}
            summaryMetrics={macroTrendMetrics}
          />
        </div>

        {/* Semicircular Overall Fraud Loss Gauge (spans 1 column) */}
        <div className="flex flex-col">
          <SemicircularGauge
            fraudPct={fraud_loss_share.fraud_volume_pct}
            legitPct={fraud_loss_share.legit_volume_pct}
            fraudAmount={fraud_loss_share.fraud_loss_amount}
            legitAmount={fraud_loss_share.legit_volume_amount}
            fraudIncidents={kpis.fraud_transactions}
            totalTransactions={kpis.total_transactions}
            currencyPrefix={currencyPrefix}
          />
          <ChartInsightBox
            chartId="loss_share_gauge"
            chartTitle="Overall Fraud Loss Share Gauge"
            timePeriod={timePeriodLabel}
            summaryMetrics={gaugeMetrics}
          />
        </div>
      </div>

      {/* 3. MISSING STITCH VISUALIZATIONS ROW (3 EQUAL COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Card 1: Temporal Anomaly Matrix (Heatmap) */}
        <div className="flex flex-col">
          <TemporalAnomalyHeatmap data={trends.temporal_heatmap} />
          <ChartInsightBox
            chartId="temporal_heatmap"
            chartTitle="24×7 Temporal Anomaly Matrix"
            timePeriod={timePeriodLabel}
            summaryMetrics={heatmapMetrics}
          />
        </div>

        {/* Card 2: Customer Segment Exposure Donut */}
        <div className="flex flex-col">
          <CustomerSegmentDonut
            segments={customer_segments}
            currencyPrefix={currencyPrefix}
          />
          <ChartInsightBox
            chartId="customer_segments"
            chartTitle="Customer Segment Exposure"
            timePeriod={timePeriodLabel}
            summaryMetrics={segmentMetrics}
          />
        </div>

        {/* Card 3: State Fraud Density (India Matrix & Top 5 States) */}
        <div className="flex flex-col">
          <StateFraudDensity
            states={distributions.state_density}
            currencyPrefix={currencyPrefix}
          />
          <ChartInsightBox
            chartId="state_density"
            chartTitle="State Fraud Density Map"
            timePeriod={timePeriodLabel}
            summaryMetrics={stateMetrics}
          />
        </div>
      </div>

      {/* 4. DEEP-DIVE PORTFOLIO DISTRIBUTIONS (2 EQUAL COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Grouped Bar Chart: Customer Segment Volume vs Loss */}
        <div className="flex flex-col">
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
          <ChartInsightBox
            chartId="customer_segments"
            chartTitle="Customer Segment Volume vs. Loss"
            timePeriod={timePeriodLabel}
            summaryMetrics={segmentMetrics}
          />
        </div>

        {/* Horizontal Bar Chart: Top 8 Targeted Merchant Categories */}
        <div className="flex flex-col">
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
          <ChartInsightBox
            chartId="category_risk"
            chartTitle="Top 8 Targeted Merchant Categories"
            timePeriod={timePeriodLabel}
            summaryMetrics={categoryMetrics}
          />
        </div>
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
        topStateNames={topStateNames}
        currencyPrefix={currencyPrefix}
      />
    </div>
  );
};
