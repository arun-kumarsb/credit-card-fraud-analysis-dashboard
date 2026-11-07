import React, { useState, useMemo } from 'react';
import { Moon, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeatmapEntry {
  Day_of_Week: string;
  Hour: number;
  total_txns: number;
  fraud_txns: number;
  total_amount?: number;
  fraud_amount?: number;
  fraud_rate_pct?: number;
}

interface TemporalAnomalyHeatmapProps {
  data: HeatmapEntry[];
}

export const TemporalAnomalyHeatmap: React.FC<TemporalAnomalyHeatmapProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'hourly'>('grouped');
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    interval: string;
    fraud: number;
    total: number;
    rate: number;
  } | null>(null);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayNameMap: Record<string, string> = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday'
  };

  // Grouped 4-hour buckets
  const timeBuckets = [
    { label: '00-04', hours: [0, 1, 2, 3] },
    { label: '04-08', hours: [4, 5, 6, 7] },
    { label: '08-12', hours: [8, 9, 10, 11] },
    { label: '12-16', hours: [12, 13, 14, 15] },
    { label: '16-20', hours: [16, 17, 18, 19] },
    { label: '20-24', hours: [20, 21, 22, 23] },
  ];

  // Process data into matrix
  const matrix = useMemo(() => {
    const map = new Map<string, { total: number; fraud: number }>();
    data.forEach((d) => {
      const key = `${d.Day_of_Week}_${d.Hour}`;
      map.set(key, { total: d.total_txns, fraud: d.fraud_txns });
    });

    if (viewMode === 'hourly') {
      const rows = [];
      for (let h = 0; h < 24; h++) {
        const rowLabel = `${String(h).padStart(2, '0')}:00`;
        const cells = days.map((day) => {
          const fullDay = dayNameMap[day];
          const val = map.get(`${fullDay}_${h}`) || { total: 0, fraud: 0 };
          return {
            day,
            interval: rowLabel,
            fraud: val.fraud,
            total: val.total,
            rate: val.total > 0 ? (val.fraud / val.total) * 100 : 0
          };
        });
        rows.push({ label: rowLabel, cells });
      }
      return rows;
    } else {
      return timeBuckets.map((bucket) => {
        const cells = days.map((day) => {
          const fullDay = dayNameMap[day];
          let total = 0;
          let fraud = 0;
          bucket.hours.forEach((h) => {
            const val = map.get(`${fullDay}_${h}`);
            if (val) {
              total += val.total;
              fraud += val.fraud;
            }
          });
          return {
            day,
            interval: bucket.label,
            fraud,
            total,
            rate: total > 0 ? (fraud / total) * 100 : 0
          };
        });
        return { label: bucket.label, cells };
      });
    }
  }, [data, viewMode]);

  // Find max fraud incidents for color scaling
  const maxFraud = useMemo(() => {
    let m = 1;
    matrix.forEach((r) => {
      r.cells.forEach((c) => {
        if (c.fraud > m) m = c.fraud;
      });
    });
    return m;
  }, [matrix]);

  // Intensity color styling
  const getCellColor = (fraud: number) => {
    const ratio = fraud / maxFraud;
    if (ratio >= 0.85) return 'bg-red-700 text-white font-bold shadow-sm';
    if (ratio >= 0.65) return 'bg-red-600 text-white font-bold';
    if (ratio >= 0.45) return 'bg-red-400 text-white font-medium';
    if (ratio >= 0.3) return 'bg-blue-300 text-slate-900';
    if (ratio >= 0.15) return 'bg-blue-100 text-slate-800';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="bg-surface rounded-2xl border border-slate-hairline p-6 shadow-ambient flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-heading">
              Temporal Anomaly Matrix
            </h3>
            <p className="text-xs text-slate-muted">
              24×7 Incident Frequency Heatmap
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grouped' ? 'hourly' : 'grouped')}
              className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-hairline bg-slate-50 hover:bg-slate-100 text-slate-muted transition-colors"
            >
              {viewMode === 'grouped' ? '24H Granular' : '4H Grouped'}
            </button>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
              <Moon className="w-3 h-3 text-red-500" />
              Night Attack
            </span>
          </div>
        </div>

        {/* Analytical Callout */}
        <div className="mb-4 p-3 rounded-xl bg-red-50/70 border border-red-100 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-body">
            <strong className="text-red-700 font-bold">00:00 – 04:00 Surge:</strong> Highest off-peak credential testing and automated bot sweeps, exceeding baseline incident rates.
          </p>
        </div>

        {/* Heatmap Matrix Grid */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[280px]">
            {/* Column Headers (Days) */}
            <div className="grid grid-cols-8 gap-1 mb-1.5 text-center text-[10px] font-bold text-slate-muted">
              <span className="text-left pl-1">HR</span>
              {days.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {matrix.map((row) => (
                <div key={row.label} className="grid grid-cols-8 gap-1 items-center">
                  <span className={`text-[10px] font-mono font-bold pl-1 ${
                    row.label === '00-04' || row.label.startsWith('00') || row.label.startsWith('01') || row.label.startsWith('02') || row.label.startsWith('03')
                      ? 'text-red-600 font-extrabold'
                      : 'text-slate-muted'
                  }`}>
                    {row.label}
                  </span>
                  {row.cells.map((cell, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-6 rounded-md text-[9px] font-mono flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:z-20 ${getCellColor(
                        cell.fraud
                      )}`}
                    >
                      {cell.fraud}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Hover Inspector */}
        <div className="mt-2 h-6 flex items-center justify-between text-[11px] text-slate-muted">
          {hoveredCell ? (
            <span>
              <strong className="text-slate-heading">{hoveredCell.day} {hoveredCell.interval}</strong>:{' '}
              <strong className="text-red-600">{hoveredCell.fraud}</strong> fraud incidents /{' '}
              {hoveredCell.total} total ({hoveredCell.rate.toFixed(1)}% rate)
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Hover over any cell for granular breakdown</span>
          )}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="pt-3 border-t border-slate-hairline flex items-center justify-between mt-3 text-[11px] text-slate-muted">
        <span>Low (0 txns)</span>
        <div className="flex items-center gap-1">
          <span className="w-3.5 h-2.5 rounded-sm bg-slate-100" title="Low"></span>
          <span className="w-3.5 h-2.5 rounded-sm bg-blue-100" title="Moderate-Low"></span>
          <span className="w-3.5 h-2.5 rounded-sm bg-blue-300" title="Moderate"></span>
          <span className="w-3.5 h-2.5 rounded-sm bg-red-400" title="High"></span>
          <span className="w-3.5 h-2.5 rounded-sm bg-red-700" title="Severe"></span>
        </div>
        <span className="font-bold text-red-600">Peak ({maxFraud} txns)</span>
      </div>
    </div>
  );
};
