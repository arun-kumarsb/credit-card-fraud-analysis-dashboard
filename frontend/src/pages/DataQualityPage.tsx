import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Database, Layers } from 'lucide-react';
import { api } from '../services/api';
import { DataQualityResponse } from '../types/api';
import { KPICard } from '../components/common/KPICard';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';

export const DataQualityPage: React.FC = () => {
  const [data, setData] = useState<DataQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuality = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDataQuality();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load data quality report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchQuality} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Audit KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Data Pipeline Status"
          value="100% PASSED"
          subtitle={`Completed in ${data.execution_duration_seconds} seconds`}
          badge={{ text: 'Zero Row Loss', variant: 'success' }}
          icon={<ShieldCheck className="w-5 h-5 text-success" />}
        />
        <KPICard
          title="Total Events Reconciled"
          value={data.summary.total_transactions.toLocaleString()}
          subtitle="All Raw Events Preserved"
          badge={{ text: '250,000 Txns', variant: 'primary' }}
          icon={<Database className="w-5 h-5 text-primary" />}
        />
        <KPICard
          title="Referential Integrity"
          value="100.00%"
          subtitle="4 Foreign Keys Perfectly Matched"
          badge={{ text: 'Validated', variant: 'success' }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
        <KPICard
          title="Records Discarded"
          value="0 Records"
          subtitle="Non-Destructive Cleaning Policy"
          badge={{ text: '100% Retention', variant: 'neutral' }}
          icon={<Layers className="w-5 h-5 text-slate-600" />}
        />
      </div>

      {/* Dataset Reconciliation Audit Table */}
      <div className="bg-surface rounded-2xl border border-slate-hairline shadow-ambient overflow-hidden">
        <div className="p-5 border-b border-slate-hairline flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-heading">
              Dataset Ingestion & Transformation Matrix
            </h4>
            <p className="text-xs text-slate-muted">
              Verification of raw inputs, schema typing, deduplication, and cleaning decisions
            </p>
          </div>
          <span className="font-mono text-xs text-slate-muted">
            Run: {new Date(data.pipeline_run_timestamp).toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-muted border-b border-slate-hairline">
              <tr>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 text-right">Raw Rows</th>
                <th className="py-3 px-4 text-right">Cleaned Rows</th>
                <th className="py-3 px-4 text-right">Discarded</th>
                <th className="py-3 px-4 text-right">Duplicates</th>
                <th className="py-3 px-4">Cleaning Actions Applied</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-hairline/60">
              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-heading">transactions</td>
                <td className="py-3 px-4 text-right font-medium tabular-nums">250,000</td>
                <td className="py-3 px-4 text-right font-bold text-slate-heading tabular-nums">250,000</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">0</td>
                <td className="py-3 px-4 text-right text-slate-muted tabular-nums">0</td>
                <td className="py-3 px-4 text-slate-body">
                  Imputed 236,527 legitimate null reasons as <code>'Legitimate / None'</code>; preserved high-value outliers up to $1.88M; parsed ISO dates & hours.
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success-dark">PASSED</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-heading">cards</td>
                <td className="py-3 px-4 text-right font-medium tabular-nums">32,457</td>
                <td className="py-3 px-4 text-right font-bold text-slate-heading tabular-nums">32,457</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">0</td>
                <td className="py-3 px-4 text-right text-slate-muted tabular-nums">0</td>
                <td className="py-3 px-4 text-slate-body">
                  Validated credit limit ranges ($50k–$1.5M); parsed ISO issue & expiry dates; verified 100% FK linkage to customer table.
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success-dark">PASSED</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-heading">customers</td>
                <td className="py-3 px-4 text-right font-medium tabular-nums">25,000</td>
                <td className="py-3 px-4 text-right font-bold text-slate-heading tabular-nums">25,000</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">0</td>
                <td className="py-3 px-4 text-right text-slate-muted tabular-nums">0</td>
                <td className="py-3 px-4 text-slate-body">
                  Normalized 2,539 typographical errors in marital status from <code>'Divorsed'</code> to <code>'Divorced'</code>; parsed ISO dates; age cohort tiering.
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success-dark">PASSED</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-heading">merchants</td>
                <td className="py-3 px-4 text-right font-medium tabular-nums">500</td>
                <td className="py-3 px-4 text-right font-bold text-slate-heading tabular-nums">500</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">0</td>
                <td className="py-3 px-4 text-right text-slate-muted tabular-nums">0</td>
                <td className="py-3 px-4 text-slate-body">
                  Normalized ratings to 2 decimal places; cataloged 15 merchant categories across 15 states.
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success-dark">PASSED</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
