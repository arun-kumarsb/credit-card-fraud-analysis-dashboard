import React, { useMemo } from 'react';
import { MapPin, Globe, Share2 } from 'lucide-react';

interface StateData {
  Customer_State: string;
  total_txns: number;
  total_amount: number;
  fraud_txns: number;
  fraud_amount: number;
  fraud_rate_pct: number;
}

interface StateFraudDensityProps {
  states: StateData[];
  currencyPrefix?: string;
}

export const StateFraudDensity: React.FC<StateFraudDensityProps> = ({
  states,
  currencyPrefix = '$'
}) => {
  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `${currencyPrefix}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${currencyPrefix}${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${currencyPrefix}${(val / 1e3).toFixed(1)}k`;
    return `${currencyPrefix}${val.toFixed(2)}`;
  };

  // State coordinate mapping on India abstract SVG canvas (200x120)
  const stateCoordinates: Record<string, { cx: number; cy: number; color: string }> = {
    'Uttar Pradesh': { cx: 110, cy: 45, color: '#EF4444' },
    'Telangana': { cx: 105, cy: 75, color: '#2563EB' },
    'Gujarat': { cx: 65, cy: 55, color: '#38BDF8' },
    'Haryana': { cx: 95, cy: 35, color: '#F59E0B' },
    'Kerala': { cx: 98, cy: 100, color: '#10B981' },
    'Punjab': { cx: 90, cy: 30, color: '#F97316' },
    'Odisha': { cx: 125, cy: 65, color: '#6366F1' },
    'West Bengal': { cx: 135, cy: 58, color: '#EC4899' },
    'Rajasthan': { cx: 75, cy: 45, color: '#EAB308' },
    'Maharashtra': { cx: 80, cy: 70, color: '#06B6D4' },
    'Karnataka': { cx: 95, cy: 85, color: '#84CC16' },
    'Tamil Nadu': { cx: 105, cy: 95, color: '#14B8A6' },
    'Madhya Pradesh': { cx: 95, cy: 55, color: '#8B5CF6' },
    'Assam': { cx: 150, cy: 40, color: '#10B981' },
    'Bihar': { cx: 125, cy: 45, color: '#F43F5E' },
  };

  // Sort states by fraud rate descending
  const topStates = useMemo(() => {
    if (!states || states.length === 0) return [];
    return [...states].sort((a, b) => b.fraud_rate_pct - a.fraud_rate_pct).slice(0, 5);
  }, [states]);

  // Total nationwide fraud amount and Top 5 share
  const concentrationStats = useMemo(() => {
    if (!states || states.length === 0) return { top5Pct: 0, totalLoss: 0, top5Loss: 0 };
    const totalNationLoss = states.reduce((sum, s) => sum + s.fraud_amount, 0);
    const top5Loss = topStates.reduce((sum, s) => sum + s.fraud_amount, 0);
    const top5Pct = totalNationLoss > 0 ? (top5Loss / totalNationLoss) * 100 : 0;
    return { top5Pct, totalLoss: totalNationLoss, top5Loss };
  }, [states, topStates]);

  if (!states || states.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-slate-hairline p-6 shadow-ambient flex flex-col items-center justify-center text-center">
        <Globe className="w-10 h-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-bold text-slate-heading">State Geographic Data Unavailable</h4>
        <p className="text-xs text-slate-muted">No state coordinates or records found in dataset.</p>
      </div>
    );
  }

  // State code abbreviation helper
  const getStateCode = (name: string) => {
    const map: Record<string, string> = {
      'Uttar Pradesh': 'UP',
      'Telangana': 'TEL',
      'Gujarat': 'GUJ',
      'Haryana': 'HAR',
      'Kerala': 'KER',
      'Odisha': 'OD',
      'Punjab': 'PB',
      'Rajasthan': 'RJ',
      'West Bengal': 'WB',
      'Karnataka': 'KA',
      'Madhya Pradesh': 'MP',
      'Maharashtra': 'MH',
      'Assam': 'AS',
      'Bihar': 'BR',
      'Tamil Nadu': 'TN'
    };
    return map[name] || name.slice(0, 3).toUpperCase();
  };

  return (
    <div className="bg-surface rounded-2xl border border-slate-hairline p-6 shadow-ambient flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-heading">
              State Fraud Density
            </h3>
            <p className="text-xs text-slate-muted">
              Geographic Concentration (India)
            </p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary" />
            Pan-India ({states.length} States)
          </span>
        </div>

        {/* Dynamic Geographic Dot Matrix India Map */}
        <div className="relative w-full h-36 my-2.5 rounded-xl bg-slate-50 border border-slate-hairline p-2 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-w-[260px]" viewBox="0 0 200 120">
            {/* Background Matrix Dots */}
            <g fill="#CBD5E1" opacity="0.6">
              <circle cx="100" cy="15" r="2" />
              <circle cx="95" cy="25" r="2" /> <circle cx="105" cy="25" r="2" />
              <circle cx="85" cy="35" r="2" /> <circle cx="95" cy="35" r="2" /> <circle cx="105" cy="35" r="2" /> <circle cx="115" cy="35" r="2" />
              <circle cx="70" cy="45" r="2" /> <circle cx="85" cy="45" r="2" /> <circle cx="100" cy="45" r="2" /> <circle cx="115" cy="45" r="2" /> <circle cx="130" cy="45" r="2" />
              <circle cx="60" cy="55" r="2" /> <circle cx="80" cy="55" r="2" /> <circle cx="100" cy="55" r="2" /> <circle cx="120" cy="55" r="2" /> <circle cx="140" cy="55" r="2" />
              <circle cx="75" cy="65" r="2" /> <circle cx="95" cy="65" r="2" /> <circle cx="115" cy="65" r="2" /> <circle cx="135" cy="65" r="2" />
              <circle cx="85" cy="75" r="2" /> <circle cx="105" cy="75" r="2" /> <circle cx="125" cy="75" r="2" />
              <circle cx="95" cy="85" r="2" /> <circle cx="115" cy="85" r="2" />
              <circle cx="100" cy="95" r="2" /> <circle cx="110" cy="95" r="2" />
              <circle cx="105" cy="108" r="2" />
            </g>

            {/* Dynamically Mapped Hotspot Nodes for the Top States */}
            {topStates.map((st, idx) => {
              const coords = stateCoordinates[st.Customer_State] || { cx: 100, cy: 60, color: '#EF4444' };
              const isTopRanked = idx === 0;

              return (
                <g key={st.Customer_State}>
                  {isTopRanked && (
                    <circle
                      cx={coords.cx}
                      cy={coords.cy}
                      r="7.5"
                      fill={coords.color}
                      fillOpacity="0.3"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    cx={coords.cx}
                    cy={coords.cy}
                    r={isTopRanked ? 4.5 : 3.5}
                    fill={coords.color}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm shadow-xs border border-slate-200 text-[10px] text-slate-700 font-semibold">
            Cluster Radius: <strong>320 km</strong>
          </div>
        </div>

        {/* Top 5 States Ranked List */}
        <div className="space-y-1.5 mt-2">
          {topStates.map((st) => (
            <div
              key={st.Customer_State}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-hairline hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none">🇮🇳</span>
                <span className="text-xs font-bold text-slate-heading">
                  {st.Customer_State} ({getStateCode(st.Customer_State)})
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="font-extrabold text-red-600 tabular-nums">
                  {st.fraud_rate_pct.toFixed(2)}%
                </span>
                <span className="text-slate-muted font-medium tabular-nums text-[11px]">
                  ({fmtCurrency(st.fraud_amount)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Concentration Summary */}
      <div className="pt-3 border-t border-slate-hairline mt-3 p-2.5 rounded-xl bg-slate-100 flex items-center gap-2 text-xs">
        <Share2 className="w-4 h-4 text-primary shrink-0" />
        <p className="text-slate-heading font-medium">
          Top 5 States account for <strong className="text-red-600 font-extrabold">{concentrationStats.top5Pct.toFixed(2)}%</strong> of nationwide exposure
        </p>
      </div>
    </div>
  );
};
