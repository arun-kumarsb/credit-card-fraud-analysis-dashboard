import React from 'react';
import { ShieldAlert, Clock, Layers, MapPin, Store } from 'lucide-react';

interface ContextualAlertsProps {
  fraudLossAmount: number;
  fraudLossPct: number;
  peakTimeWindow?: string;
  topCategoryName?: string;
  topCategoryLoss?: number;
  topSegmentName?: string;
  topSegmentLossPct?: number;
  topStatesConcentrationPct?: number;
  currencyPrefix?: string;
}

export const ContextualAlerts: React.FC<ContextualAlertsProps> = ({
  fraudLossAmount,
  fraudLossPct,
  peakTimeWindow = '00:00 – 04:00 Night Surge',
  topCategoryName = 'Hotels',
  topCategoryLoss = 112000000,
  topSegmentName = 'Platinum',
  topSegmentLossPct = 48.6,
  topStatesConcentrationPct = 28.38,
  currencyPrefix = '$'
}) => {
  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `${currencyPrefix}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${currencyPrefix}${(val / 1e6).toFixed(1)}M`;
    return `${currencyPrefix}${val.toLocaleString()}`;
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-slate-hairline shadow-ambient">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold text-slate-heading flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          Empirical Data Visualizations & Statistical Observations
        </h4>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Audited 250k Ledger
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-body">
        {/* Card 1: Loss Asymmetry */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-heading font-bold mb-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Financial Loss Asymmetry
            </div>
            <p className="text-slate-muted leading-relaxed">
              Fraud represents only <strong className="text-slate-heading">5.39%</strong> of transaction counts but accounts for{' '}
              <strong className="text-red-600 font-extrabold">{fraudLossPct.toFixed(2)}% ({fmtCurrency(fraudLossAmount)})</strong> of all settled value.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-red-600 uppercase tracking-wide">
            Critical Capital Severity
          </div>
        </div>

        {/* Card 2: Temporal Window */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-heading font-bold mb-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Temporal Attack Window
            </div>
            <p className="text-slate-muted leading-relaxed">
              Automated testing and credential stuffing peak heavily in the{' '}
              <strong className="text-slate-heading">{peakTimeWindow}</strong> interval, where fraud frequency is <strong className="text-red-600 font-bold">2.4×</strong> daytime averages.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
            Automated Night Attack
          </div>
        </div>

        {/* Card 3: Tier Concentration */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-heading font-bold mb-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Customer Tier Concentration
            </div>
            <p className="text-slate-muted leading-relaxed">
              The <strong className="text-slate-heading">{topSegmentName} Tier</strong> absorbs{' '}
              <strong className="text-blue-600 font-extrabold">{topSegmentLossPct.toFixed(1)}%</strong> of all net fraud dollar losses, driven by higher available credit lines.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
            High-Limit Vulnerability
          </div>
        </div>

        {/* Card 4: Geographic Hotspots */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-heading font-bold mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Geographic Concentration
            </div>
            <p className="text-slate-muted leading-relaxed">
              Top 5 Indian states account for{' '}
              <strong className="text-emerald-700 font-extrabold">{topStatesConcentrationPct.toFixed(1)}%</strong> of national fraud loss, with Uttar Pradesh and Telangana demonstrating peak incident rates.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
            Regional Attack Clusters
          </div>
        </div>
      </div>
    </div>
  );
};
