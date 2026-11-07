import React from 'react';
import { Info, AlertCircle } from 'lucide-react';

interface SemicircularGaugeProps {
  fraudPct: number;
  legitPct: number;
  fraudAmount: number;
  legitAmount: number;
  fraudIncidents: number;
  totalTransactions?: number;
  currencyPrefix?: string;
}

export const SemicircularGauge: React.FC<SemicircularGaugeProps> = ({
  fraudPct,
  legitPct,
  fraudAmount,
  legitAmount,
  fraudIncidents,
  totalTransactions = 250000,
  currencyPrefix = '$'
}) => {
  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `${currencyPrefix}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${currencyPrefix}${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `${currencyPrefix}${(val / 1e3).toFixed(1)}k`;
    return `${currencyPrefix}${val.toFixed(2)}`;
  };

  // Math for 180-degree semicircular arc:
  // Radius = 78, Total length = PI * 78 ≈ 245.044
  const radius = 78;
  const totalLength = Math.PI * radius;
  const strokeRatio = Math.min(Math.max(fraudPct / 100, 0), 1);
  const strokeOffset = totalLength * (1 - strokeRatio);

  return (
    <div className="bg-surface rounded-2xl border border-slate-hairline p-6 shadow-ambient flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-heading">
                Overall Fraud Loss Share
              </h3>
              <div className="relative group cursor-pointer text-slate-muted hover:text-primary transition-colors">
                <Info className="w-4 h-4" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap z-30 shadow-elevated">
                  <span>Aggregated financial loss vs settled volume</span>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mb-1"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-muted mt-0.5">
              Calculated over {totalTransactions.toLocaleString()} audited ledger logs
            </p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
            Critical Threat
          </span>
        </div>

        {/* Semi-circular Radial Arc Gauge SVG */}
        <div className="flex flex-col items-center justify-center my-4 relative">
          <svg className="w-64 h-36 overflow-visible" viewBox="0 0 200 115">
            <defs>
              <linearGradient id="gaugeBgGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#EEF2F6" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id="gaugeValGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="65%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
              <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background Track Arc (180 deg): Radius 78, Center (100, 95) */}
            <path
              d="M 22 95 A 78 78 0 0 1 178 95"
              fill="none"
              stroke="url(#gaugeBgGrad)"
              strokeLinecap="round"
              strokeWidth="16"
            />

            {/* Filled Progress Arc */}
            <path
              d="M 22 95 A 78 78 0 0 1 178 95"
              fill="none"
              filter="url(#gaugeShadow)"
              stroke="url(#gaugeValGrad)"
              strokeDasharray={totalLength.toFixed(2)}
              strokeDashoffset={strokeOffset.toFixed(2)}
              strokeLinecap="round"
              strokeWidth="16"
            />

            {/* 50% Threshold Marker */}
            <line stroke="#94A3B8" strokeLinecap="round" strokeWidth="2" x1="100" x2="100" y1="17" y2="25" />
            <text className="text-[9px] font-semibold fill-slate-400" textAnchor="middle" x="100" y="32">
              50%
            </text>
          </svg>

          {/* Centered Percentage Display */}
          <div className="flex flex-col items-center -mt-12">
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-extrabold text-slate-heading tracking-tight">
                {fraudPct.toFixed(1)}
              </span>
              <span className="text-xl font-extrabold text-red-600">%</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
              Fraud Loss Ratio
            </span>
          </div>
        </div>

        {/* Loss Callout Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-hairline text-center">
          <p className="text-sm font-bold text-slate-heading tabular-nums">
            {fmtCurrency(fraudAmount)} Loss
          </p>
          <p className="text-xs text-slate-muted mt-0.5">
            Attributed across {fraudIncidents.toLocaleString()} confirmed fraud incidents
          </p>
        </div>
      </div>

      {/* Bottom Metric Pills */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-hairline mt-4">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-hairline flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-semibold text-slate-muted">Legitimate Vol</span>
          </div>
          <span className="text-sm font-extrabold text-slate-heading">{legitPct.toFixed(1)}%</span>
          <span className="text-[11px] font-medium text-emerald-600">{fmtCurrency(legitAmount)}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-100 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-red-800">Fraud Loss</span>
          </div>
          <span className="text-sm font-extrabold text-red-600">{fraudPct.toFixed(1)}%</span>
          <span className="text-[11px] font-medium text-red-600">{fmtCurrency(fraudAmount)}</span>
        </div>
      </div>
    </div>
  );
};
