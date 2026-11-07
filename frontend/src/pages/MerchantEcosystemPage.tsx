import React, { useEffect, useState } from 'react';
import {
  Store,
  ShieldAlert,
  Star,
  Building2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { MerchantAnalyticsResponse } from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';

interface MerchantEcosystemPageProps {
  startDate?: string;
  endDate?: string;
}

export const MerchantEcosystemPage: React.FC<MerchantEcosystemPageProps> = ({
  startDate,
  endDate
}) => {
  const [data, setData] = useState<MerchantAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchantAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMerchantAnalytics(startDate, endDate);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load merchant ecosystem analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantAnalytics();
  }, [startDate, endDate]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchMerchantAnalytics} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Merchant Ecosystem"
          value={data.total_merchants.toLocaleString()}
          subtitle="15 Categories, 80 National Brands"
          badge={{ text: '100% Active Directory', variant: 'primary' }}
          icon={<Store className="w-5 h-5 text-primary" />}
        />
        <KPICard
          title="High-Risk Merchants"
          value="62 Entities"
          subtitle="12.4% Under Continuous Audit"
          badge={{ text: 'Elevated Risk', variant: 'danger' }}
          icon={<ShieldAlert className="w-5 h-5 text-danger" />}
        />
        <KPICard
          title="Average Network Rating"
          value="4.29 ★"
          subtitle="Range 3.5 to 5.0 Stars"
          badge={{ text: 'Quality Score', variant: 'neutral' }}
          icon={<Star className="w-5 h-5 text-amber-500" />}
        />
        <KPICard
          title="High-Risk Sector"
          value="Hotels & Travel"
          subtitle="$254M Combined Fraud Exposure"
          badge={{ text: 'Critical Sector', variant: 'warning' }}
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Row 1: 15 Categories Volume vs Fraud Loss */}
      <ChartCard
        title="15 Merchant Categories: Total Volume vs. Fraud Loss"
        subtitle="Comparative analysis of transaction capital vs fraud drain across merchant sectors (in Millions USD)"
        height={300}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.category_risk_comparison || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="Merchant_Category" tick={{ fontSize: 9, fill: '#0F172A' }} interval={0} angle={-30} textAnchor="end" height={60} />
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

      {/* Row 2: Merchant Risk Exposure & Rating vs Fraud Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Risk Level Breakdown */}
        <ChartCard
          title="Merchant Risk Level Distribution"
          subtitle="Proportion of merchants categorized by automated risk engines"
          height={260}
        >
          <div className="space-y-4 flex flex-col justify-center h-full">
            {(data.risk_level_distribution || []).map((r: any) => {
              const pct = ((r.count / data.total_merchants) * 100).toFixed(1);
              return (
                <div key={r.merchant_risk_level} className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.merchant_risk_level} type="risk" />
                      <span className="font-semibold text-slate-heading">Risk Classification</span>
                    </div>
                    <span className="font-bold text-slate-heading tabular-nums">{r.count} Merchants ({pct}%)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-muted mt-2">
                    <span>Average Merchant Rating: ★ {r.avg_rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Rating vs Fraud Rate Correlation */}
        <ChartCard
          title="Merchant Rating vs. Fraud Rate Matrix"
          subtitle="Correlation between public customer rating and detected fraud incident rates"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.rating_vs_fraud || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="merchant_rating" tick={{ fontSize: 10, fill: '#64748B' }} label={{ value: 'Star Rating', position: 'insideBottom', offset: -5, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Fraud Rate']}
                labelFormatter={(lbl) => `Rating: ★ ${lbl}`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Line type="monotone" dataKey="fraud_rate_pct" name="Fraud Rate (%)" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Top At-Risk Merchant Watchlist */}
      <div className="bg-surface rounded-2xl border border-slate-hairline shadow-ambient overflow-hidden">
        <div className="p-5 border-b border-slate-hairline flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-heading flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger" />
              Top At-Risk Merchant Watchlist
            </h4>
            <p className="text-xs text-slate-muted">
              Entities ranked by highest accumulated fraud volume and incident frequencies
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-danger-light text-danger-dark border border-danger/20">
            Top 25 Active Surveillance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-muted border-b border-slate-hairline">
              <tr>
                <th className="py-3 px-4">Merchant Entity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Risk Profile</th>
                <th className="py-3 px-4 text-right">Transactions</th>
                <th className="py-3 px-4 text-right">Fraud Count</th>
                <th className="py-3 px-4 text-right">Fraud Loss</th>
                <th className="py-3 px-4 text-right">Fraud Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-hairline/60">
              {(data.top_watchlist || []).slice(0, 10).map((m: any) => (
                <tr key={m.Merchant_ID} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-heading">{m.Merchant_Name}</div>
                    <div className="font-mono text-[10px] text-slate-muted">{m.Merchant_ID}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-heading">
                    {m.Merchant_Category}
                  </td>
                  <td className="py-3 px-4 text-slate-muted">
                    {m.City}, {m.State}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={m.Merchant_Risk_Level} type="risk" />
                      <span className="text-amber-600 font-bold">★ {m.Merchant_Rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-heading tabular-nums">
                    {(m.total_txns || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-danger tabular-nums">
                    {(m.fraud_txns || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-danger tabular-nums">
                    ${(m.fraud_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-heading tabular-nums">
                    {m.fraud_rate_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
