import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  AlertOctagon,
  Wifi,
  Layers,
  CheckCircle
} from 'lucide-react';
import {
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
import { api } from '../services/api';
import { CardAnalyticsResponse } from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';

export const CardsPortfolioPage: React.FC = () => {
  const [data, setData] = useState<CardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCardAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCardAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load card portfolio analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardAnalytics();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchCardAnalytics} />;
  if (!data) return null;

  const networkColors = ['#004AC6', '#2563EB', '#38BDF8', '#F59E0B'];
  const statusColors: Record<string, string> = {
    Active: '#10B981',
    Expired: '#F59E0B',
    Blocked: '#EF4444',
    Lost: '#BA1A1A'
  };

  const fmtCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Card Portfolio"
          value={data.total_cards.toLocaleString()}
          subtitle="Issued Across 25,000 Customers"
          badge={{ text: '1.30 Cards/User', variant: 'primary' }}
          icon={<CreditCard className="w-5 h-5 text-primary" />}
        />
        <KPICard
          title="Credit Limit Exposure"
          value={fmtCurrency(data.total_credit_limit_exposure)}
          subtitle={`Avg Limit: $${data.avg_credit_limit.toLocaleString()}`}
          badge={{ text: 'Underwritten', variant: 'neutral' }}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
        />
        <KPICard
          title="Operational Active Share"
          value="93.86%"
          subtitle="30,463 Active Cards"
          badge={{ text: 'Normal Operations', variant: 'success' }}
          icon={<CheckCircle className="w-5 h-5 text-success" />}
        />
        <KPICard
          title="Lifecycle Attrition"
          value="1,994 Cards"
          subtitle="1,007 Expired | 646 Blocked | 341 Lost"
          badge={{ text: 'High Risk Assets', variant: 'danger' }}
          icon={<AlertOctagon className="w-5 h-5 text-danger" />}
        />
      </div>

      {/* Row 1: Network Share & Card Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Network Distribution */}
        <ChartCard
          title="Payment Network Market Share"
          subtitle="Distribution of issued cards across major payment networks"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.network_distribution || []}
                dataKey="count"
                nameKey="network"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ payload, percent }) => `${payload?.network || ''} (${((percent || 0) * 100).toFixed(1)}%)`}
              >
                {(data.network_distribution || []).map((_, index: number) => (
                  <Cell key={`cell-${index}`} fill={networkColors[index % networkColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${Number(val).toLocaleString()} cards`, 'Issued']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Card Tier Distribution (Gold, Silver, Classic, Platinum) */}
        <ChartCard
          title="Card Tier Portfolio Mix"
          subtitle="Card count per membership tier (Gold, Silver, Classic, Platinum)"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.card_type_distribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="tier" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toLocaleString()} cards`, 'Count']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="count" name="Cards" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Operational Status & Credit Limit Tier Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Status Breakdown */}
        <ChartCard
          title="Operational Status Breakdown"
          subtitle="Active, Expired, Blocked, and Lost card state lifecycle"
          height={260}
        >
          <div className="space-y-3 flex flex-col justify-center h-full">
            {(data.operational_status_distribution || []).map((st: any) => {
              const color = statusColors[st.status] || '#64748B';
              return (
                <div key={st.status} className="p-3 rounded-xl bg-slate-50 border border-slate-hairline flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                    <span className="font-bold text-xs text-slate-heading">{st.status} Cards</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs text-slate-heading tabular-nums">{(st.count || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-muted">{st.pct}% of portfolio</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Credit Limit Tier Risk & Exposure (spans 2 columns) */}
        <ChartCard
          title="Credit Limit Tier Exposure vs. Fraud Loss"
          subtitle="Financial fraud damage experienced by card credit limit tiers"
          className="lg:col-span-2"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.limit_tier_risk || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="credit_limit_tier" tick={{ fontSize: 10, fill: '#64748B' }} />
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
      </div>

      {/* Form Factor & Tokenization Technology Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-slate-hairline shadow-ambient flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-heading flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-primary" />
              Form Factor Mix
            </span>
            <p className="text-xs text-slate-muted">Physical plastic vs Virtual digital cards</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="text-right">
              <span className="block font-bold text-slate-heading">80.13%</span>
              <span className="text-[10px] text-slate-muted">Physical (26k)</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-primary">19.87%</span>
              <span className="text-[10px] text-slate-muted">Virtual (6.4k)</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-slate-hairline shadow-ambient flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-heading flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-emerald-600" />
              NFC Contactless Adoption
            </span>
            <p className="text-xs text-slate-muted">Tap-to-pay enablement ratio</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="text-right">
              <span className="block font-bold text-emerald-600">85.13%</span>
              <span className="text-[10px] text-slate-muted">Enabled (27.6k)</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-slate-heading">14.87%</span>
              <span className="text-[10px] text-slate-muted">Disabled (4.8k)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
