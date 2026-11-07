import React, { useMemo } from 'react';
import { Layers, ShieldAlert } from 'lucide-react';

interface SegmentData {
  Customer_Segment: string;
  total_txns: number;
  total_amount: number;
  fraud_txns: number;
  fraud_amount: number;
  fraud_rate_pct: number;
}

interface CustomerSegmentDonutProps {
  segments: SegmentData[];
  currencyPrefix?: string;
}

export const CustomerSegmentDonut: React.FC<CustomerSegmentDonutProps> = ({
  segments,
  currencyPrefix = '$'
}) => {
  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `${currencyPrefix}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${currencyPrefix}${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${currencyPrefix}${(val / 1e3).toFixed(1)}k`;
    return `${currencyPrefix}${val.toFixed(2)}`;
  };

  // Fixed colors for the 4 tiers matching the design system
  const tierConfig: Record<string, { color: string; bgBadge: string; textBadge: string; dotClass: string }> = {
    Platinum: {
      color: '#2563EB',
      bgBadge: 'bg-blue-50 border border-blue-200',
      textBadge: 'text-blue-700',
      dotClass: 'bg-blue-600'
    },
    Gold: {
      color: '#38BDF8',
      bgBadge: 'bg-sky-50 border border-sky-200',
      textBadge: 'text-sky-700',
      dotClass: 'bg-sky-500'
    },
    Standard: {
      color: '#64748B',
      bgBadge: 'bg-slate-100 border border-slate-200',
      textBadge: 'text-slate-700',
      dotClass: 'bg-slate-500'
    },
    Basic: {
      color: '#10B981',
      bgBadge: 'bg-emerald-50 border border-emerald-200',
      textBadge: 'text-emerald-700',
      dotClass: 'bg-emerald-500'
    }
  };

  const { totalLoss, enrichedSegments } = useMemo(() => {
    const sumLoss = segments.reduce((acc, s) => acc + s.fraud_amount, 0);
    const sorted = [...segments].sort((a, b) => b.fraud_amount - a.fraud_amount);
    const enriched = sorted.map((s) => {
      const sharePct = sumLoss > 0 ? (s.fraud_amount / sumLoss) * 100 : 0;
      return {
        ...s,
        sharePct,
        config: tierConfig[s.Customer_Segment] || {
          color: '#94A3B8',
          bgBadge: 'bg-slate-50 border border-slate-200',
          textBadge: 'text-slate-600',
          dotClass: 'bg-slate-400'
        }
      };
    });
    return { totalLoss: sumLoss, enrichedSegments: enriched };
  }, [segments]);

  // SVG Donut Slices: Radius = 60, Circumference = 2 * PI * 60 ≈ 376.99
  const circumference = 376.99;
  let accumulatedOffset = 0;

  return (
    <div className="bg-surface rounded-2xl border border-slate-hairline p-6 shadow-ambient flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-heading">
              Customer Segment Exposure
            </h3>
            <p className="text-xs text-slate-muted">
              Loss Distribution by Portfolio Tier
            </p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <Layers className="w-3 h-3 text-primary" />
            4 Tiers
          </span>
        </div>

        {/* Donut Chart SVG */}
        <div className="relative flex items-center justify-center my-3">
          <svg className="w-48 h-48 -rotate-90 overflow-visible" viewBox="0 0 160 160">
            {enrichedSegments.map((s) => {
              const strokeLength = (s.sharePct / 100) * circumference;
              const currentOffset = accumulatedOffset;
              accumulatedOffset -= strokeLength;

              return (
                <circle
                  key={s.Customer_Segment}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={s.config.color}
                  strokeWidth="18"
                  strokeDasharray={`${strokeLength.toFixed(2)} ${circumference.toFixed(2)}`}
                  strokeDashoffset={currentOffset.toFixed(2)}
                  className="transition-all duration-300 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-heading leading-tight tabular-nums">
              {fmtCurrency(totalLoss)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
              Total Loss
            </span>
          </div>
        </div>

        {/* Detailed Segments List */}
        <div className="space-y-1.5 mt-2">
          {enrichedSegments.map((s) => (
            <div
              key={s.Customer_Segment}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-hairline hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${s.config.dotClass}`}></span>
                <span className="text-xs font-bold text-slate-heading">
                  {s.Customer_Segment} Tier
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-heading tabular-nums">
                  {fmtCurrency(s.fraud_amount)}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums ${s.config.bgBadge} ${s.config.textBadge}`}
                >
                  {s.sharePct.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footnote Observation computed dynamically */}
      <div className="pt-3 border-t border-slate-hairline mt-3 text-center text-xs text-slate-muted">
        {enrichedSegments.length > 0 && (
          <span>
            <strong className="text-slate-heading">{enrichedSegments[0].Customer_Segment} Tier</strong> carries the highest loss burden, representing{' '}
            <strong className="text-blue-600 font-bold">{enrichedSegments[0].sharePct.toFixed(1)}%</strong> of net fraud capital.
          </span>
        )}
      </div>
    </div>
  );
};
