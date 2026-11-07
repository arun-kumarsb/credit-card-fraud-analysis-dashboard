import React, { useEffect, useState } from 'react';
import {
  Users,
  CreditCard,
  ShieldAlert,
  Wallet,
  Activity
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
import { api } from '../services/api';
import { CustomerAnalyticsResponse } from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';

interface CustomerAnalyticsPageProps {
  startDate?: string;
  endDate?: string;
}

export const CustomerAnalyticsPage: React.FC<CustomerAnalyticsPageProps> = ({
  startDate,
  endDate
}) => {
  const [data, setData] = useState<CustomerAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCustomerAnalytics(startDate, endDate);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerAnalytics();
  }, [startDate, endDate]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchCustomerAnalytics} />;
  if (!data) return null;

  const fmtCurrency = (val: number) => {
    if (!val) return '$0';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Customer Portfolio Size"
          value={data.total_customers.toLocaleString()}
          subtitle="15 States, 85 Indian Cities"
          badge={{ text: '100% Verified', variant: 'primary' }}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <KPICard
          title="Average Annual Income"
          value={`$${(data.avg_annual_income / 1e5).toFixed(2)} Lakh`}
          subtitle={`$${data.avg_annual_income.toLocaleString()} Mean`}
          badge={{ text: 'Demographic Baseline', variant: 'neutral' }}
          icon={<Wallet className="w-5 h-5 text-emerald-600" />}
        />
        <KPICard
          title="Top Account Type"
          value="Savings (45.6%)"
          subtitle="Followed by Salary (42.0%)"
          badge={{ text: 'Banking Mix', variant: 'primary' }}
          icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
        />
        <KPICard
          title="High Exposure Segment"
          value="Platinum Tier"
          subtitle="42.8% of Total Fraud Losses"
          badge={{ text: 'Prime Target', variant: 'danger' }}
          icon={<ShieldAlert className="w-5 h-5 text-danger" />}
        />
      </div>

      {/* Row 1: Age Cohort Risk & Income vs Loss Covariance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Cohorts vs Fraud Rate */}
        <ChartCard
          title="Age Demographics & Fraud Attack Rate"
          subtitle="Fraud event incidence across demographic cohorts"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.age_cohort_risk || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="Age_Group" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" domain={[0, 8]} />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Fraud Rate']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="fraud_rate_pct" name="Fraud Rate (%)" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income Tiers vs Fraud Loss Covariance */}
        <ChartCard
          title="Income Tier vs. Financial Loss Covariance"
          subtitle="Total capital lost across customer income brackets"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.income_tier_risk || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="income_tier" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Fraud Loss']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="fraud_amount" name="Fraud Loss" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: 12 Targeted Occupations Risk & Account Type Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Targeted Occupations (spans 2 columns) */}
        <ChartCard
          title="Occupational Vulnerability Analysis"
          subtitle="Fraud attack frequency across 12 occupation categories"
          className="lg:col-span-2"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.occupation_risk || []}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} unit="%" domain={[0, 8]} />
              <YAxis type="category" dataKey="Occupation" tick={{ fontSize: 10, fill: '#0F172A' }} />
              <Tooltip
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Fraud Incident Rate']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="fraud_rate_pct" name="Fraud Rate (%)" fill="#004AC6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Account Type Banking Matrix */}
        <ChartCard
          title="Banking Relationship Matrix"
          subtitle="Account classifications distribution"
          height={300}
        >
          <div className="flex flex-col justify-center h-full space-y-3">
            {(data.account_type_matrix || []).map((acct: any) => {
              const rate = acct.fraud_rate_pct !== undefined 
                ? acct.fraud_rate_pct 
                : (acct.total_txns > 0 ? (acct.fraud_txns / acct.total_txns) * 100 : 0);
              return (
                <div key={acct.account_type} className="p-3 rounded-xl bg-slate-50 border border-slate-hairline">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-slate-heading">{acct.account_type} Account</span>
                    <span className="font-semibold text-danger tabular-nums">{Number(rate).toFixed(2)}% Fraud</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-muted">
                    <span>{(acct.customer_count || 0).toLocaleString()} Customers</span>
                    <span className="font-medium">{fmtCurrency(acct.fraud_amount)} Loss</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, rate * 14)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Marital Status & Demographic Findings Callout */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-hairline shadow-ambient">
        <h4 className="text-base font-bold text-slate-heading mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Demographic Risk Patterns & Privacy Policy
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-body">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
            <span className="font-bold text-slate-heading block mb-1">Affluent Target Vectors</span>
            Customers with annual incomes exceeding <strong>$2.5M</strong> endure <strong>64.2%</strong> of all fraudulent capital drains, despite representing only 32% of total customers.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
            <span className="font-bold text-slate-heading block mb-1">Household Status Risk</span>
            Across Married (70.7%), Single (19.2%), and Divorced (10.2%) cohorts, fraud rates remain consistent at <strong>5.2% – 5.5%</strong>, proving fraud is channel-driven rather than lifestyle-driven.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline">
            <span className="font-bold text-slate-heading block mb-1">Privacy & Compliance</span>
            In compliance with PCI-DSS and financial privacy regulations, customer names and identifiers are never exposed in public aggregation views.
          </div>
        </div>
      </div>
    </div>
  );
};
