import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { MonthlyTrendItem } from '../../types/api';

interface MacroVolumeTrendChartProps {
  monthlyData: MonthlyTrendItem[];
  totalGross: number;
  totalFraud: number;
  currencyPrefix?: string;
}

export const MacroVolumeTrendChart: React.FC<MacroVolumeTrendChartProps> = ({
  monthlyData,
  totalGross,
  totalFraud,
  currencyPrefix = '$',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fmtCurrency = (val: number) => {
    if (val >= 1e9) return `${currencyPrefix}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${currencyPrefix}${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${currencyPrefix}${(val / 1e3).toFixed(1)}k`;
    return `${currencyPrefix}${val.toFixed(2)}`;
  };

  // Dimensions of the SVG canvas
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;

  const chartWidth = svgWidth - paddingLeft - paddingRight; // 710
  const chartHeight = svgHeight - paddingTop - paddingBottom; // 200
  const baseY = svgHeight - paddingBottom; // 230

  // Calculate dynamic maxY from actual data
  const maxY = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return 160000000;
    const peakMonthlyGross = Math.max(...monthlyData.map((m) => m.total_amount));
    // Round up to nearest 40M step
    const step = 40000000;
    return Math.max(Math.ceil((peakMonthlyGross * 1.15) / step) * step, 40000000);
  }, [monthlyData]);

  // Find the peak fraud month dynamically in the dataset
  const { peakIndex, peakItem, points, xAxisMilestones } = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return { peakIndex: -1, peakItem: null, points: [], xAxisMilestones: [] };
    }

    let pIdx = 0;
    let maxFraud = monthlyData[0].fraud_amount;

    // Mathematically find the peak fraud loss month dynamically from the actual dataset
    monthlyData.forEach((m, idx) => {
      if (m.fraud_amount > maxFraud) {
        maxFraud = m.fraud_amount;
        pIdx = idx;
      }
    });

    const n = monthlyData.length;
    const computedPoints = monthlyData.map((m, idx) => {
      const x = paddingLeft + (idx / Math.max(n - 1, 1)) * chartWidth;
      const yGross = baseY - (Math.min(m.total_amount, maxY) / maxY) * chartHeight;
      const yFraud = baseY - (Math.min(m.fraud_amount, maxY) / maxY) * chartHeight;
      return { x, yGross, yFraud, item: m, index: idx };
    });

    // Dynamic X-axis milestone markers without text collisions
    const milestones: Array<{ x: number; label: string; align: 'start' | 'middle' | 'end'; isPeak?: boolean }> = [];
    if (computedPoints.length > 0) {
      const first = computedPoints[0];
      const last = computedPoints[computedPoints.length - 1];
      const peakPt = computedPoints[pIdx];

      // 1. Start milestone
      milestones.push({ x: first.x, label: first.item.Year_Month, align: 'start' });

      // Peak distance checks
      const distPeakFromFirst = Math.abs(peakPt.x - first.x);
      const distPeakFromLast = Math.abs(last.x - peakPt.x);
      const isPeakNearEnd = distPeakFromLast < 70;
      const isPeakNearStart = distPeakFromFirst < 70;

      // 2. Intermediate quarter/half candidates
      const candidateIndices = [
        Math.floor(computedPoints.length * 0.25),
        Math.floor(computedPoints.length * 0.50),
        Math.floor(computedPoints.length * 0.75),
      ];

      for (const cIdx of candidateIndices) {
        const cand = computedPoints[cIdx];
        if (!cand) continue;
        if (
          Math.abs(cand.x - first.x) >= 65 &&
          Math.abs(cand.x - last.x) >= 65 &&
          Math.abs(cand.x - peakPt.x) >= 65 &&
          milestones.every((m) => Math.abs(cand.x - m.x) >= 65)
        ) {
          milestones.push({ x: cand.x, label: cand.item.Year_Month, align: 'middle' });
        }
      }

      // 3. Peak milestone (bold red)
      milestones.push({
        x: peakPt.x,
        label: `${peakPt.item.Year_Month} (Peak)`,
        align: isPeakNearEnd ? 'end' : isPeakNearStart ? 'start' : 'middle',
        isPeak: true,
      });

      // 4. End milestone (if peak is not already at the end)
      if (!isPeakNearEnd) {
        milestones.push({ x: last.x, label: last.item.Year_Month, align: 'end' });
      }
    }

    return {
      peakIndex: pIdx,
      peakItem: monthlyData[pIdx],
      points: computedPoints,
      xAxisMilestones: milestones
    };
  }, [monthlyData, chartWidth, chartHeight, baseY, maxY]);

  // Construct smooth bezier curves through points
  const { grossPath, grossAreaPath, fraudPath } = useMemo(() => {
    if (points.length === 0) return { grossPath: '', grossAreaPath: '', fraudPath: '' };

    const getBezierPath = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
      let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? i : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return path;
    };

    const grossPts = points.map((p) => ({ x: p.x, y: p.yGross }));
    const fraudPts = points.map((p) => ({ x: p.x, y: p.yFraud }));

    const gPath = getBezierPath(grossPts);
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const gArea = `${gPath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
    const fPath = getBezierPath(fraudPts);

    return { grossPath: gPath, grossAreaPath: gArea, fraudPath: fPath };
  }, [points, baseY]);

  // Dynamic gradient stops for Elevated Threat Crest along the baseline loss spline
  const threatGradientStops = useMemo(() => {
    if (points.length < 2 || peakIndex === -1) {
      return (
        <>
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#2563EB" />
        </>
      );
    }

    const maxFraud = monthlyData[peakIndex]?.fraud_amount || 1;
    const elevatedThreshold = maxFraud * 0.72;

    // Expand to find continuous elevated surge window around the peak
    let startIdx = peakIndex;
    let endIdx = peakIndex;
    while (startIdx > 0 && monthlyData[startIdx - 1].fraud_amount >= elevatedThreshold) {
      startIdx--;
    }
    while (endIdx < monthlyData.length - 1 && monthlyData[endIdx + 1].fraud_amount >= elevatedThreshold) {
      endIdx++;
    }

    const xStart = points[startIdx].x;
    const xEnd = points[endIdx].x;

    // Convert pixel coordinates to percentage along the spline
    let pStart = ((xStart - paddingLeft) / chartWidth) * 100;
    let pEnd = ((xEnd - paddingLeft) / chartWidth) * 100;

    // Ensure a clear, visible crest span if start and end are too close
    if (pEnd - pStart < 10) {
      const center = (pStart + pEnd) / 2;
      pStart = Math.max(0, center - 5);
      pEnd = Math.min(100, center + 5);
    }

    const blend = 3;
    const s0 = Math.max(0, pStart - blend).toFixed(1);
    const s1 = pStart.toFixed(1);
    const s2 = pEnd.toFixed(1);
    const s3 = Math.min(100, pEnd + blend).toFixed(1);

    return (
      <>
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset={`${s0}%`} stopColor="#2563EB" />
        <stop offset={`${s1}%`} stopColor="#EF4444" />
        <stop offset={`${s2}%`} stopColor="#EF4444" />
        <stop offset={`${s3}%`} stopColor="#2563EB" />
        <stop offset="100%" stopColor="#2563EB" />
      </>
    );
  }, [points, peakIndex, monthlyData, chartWidth, paddingLeft]);

  // Selected or active item for tooltip
  const activePoint = hoveredIndex !== null && points[hoveredIndex]
    ? points[hoveredIndex]
    : points[peakIndex] || null;

  const isPeak = activePoint && activePoint.index === peakIndex;

  return (
    <div className="bg-surface rounded-2xl border border-slate-hairline p-6 shadow-ambient flex flex-col justify-between h-full">
      {/* 1. Header with Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-heading">
            3-Year Gross Volume vs Fraud Loss
          </h3>
          <p className="text-xs text-slate-muted">
            Baseline transaction volume vs. detected leakages
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-50 border border-sky-100 text-sky-800">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span className="text-xs font-bold tabular-nums">
              Total Gross: {fmtCurrency(totalGross)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-50 border border-red-100 text-red-800">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold tabular-nums">
              Net Fraud: {fmtCurrency(totalFraud)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SVG Dual Spline Chart Area */}
      <div className="relative w-full h-[280px] my-3 select-none">
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <defs>
            <linearGradient id="grossAreaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="fraudStrokeGrad" x1="0%" x2="100%" y1="0%" y2="0%">
              {threatGradientStops}
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Scale */}
          <g stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1">
            <line x1="50" x2="780" y1="30" y2="30" />
            <line x1="50" x2="780" y1="80" y2="80" />
            <line x1="50" x2="780" y1="130" y2="130" />
            <line x1="50" x2="780" y1="180" y2="180" />
            <line x1="50" x2="780" y1="230" y2="230" />
          </g>

          {/* Dynamic Y-Axis Labels based on calculated maxY */}
          <g className="text-[10px] font-semibold" fill="#94A3B8">
            <text textAnchor="end" x="42" y="34">{fmtCurrency(maxY)}</text>
            <text textAnchor="end" x="42" y="84">{fmtCurrency(maxY * 0.75)}</text>
            <text textAnchor="end" x="42" y="134">{fmtCurrency(maxY * 0.5)}</text>
            <text textAnchor="end" x="42" y="184">{fmtCurrency(maxY * 0.25)}</text>
            <text textAnchor="end" x="42" y="234">{fmtCurrency(0)}</text>
          </g>

          {/* Spline 1: Gross Volume Area & Stroke */}
          {grossAreaPath && <path d={grossAreaPath} fill="url(#grossAreaGrad)" />}
          {grossPath && (
            <path
              d={grossPath}
              fill="none"
              stroke="#38BDF8"
              strokeLinecap="round"
              strokeWidth="3"
            />
          )}

          {/* Spline 2: Fraud Loss Trend */}
          {fraudPath && (
            <path
              d={fraudPath}
              fill="none"
              stroke="url(#fraudStrokeGrad)"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          )}

          {/* Active Highlight Marker Line & Nodes */}
          {activePoint && (
            <g className="transition-all duration-200">
              <line
                stroke={isPeak ? '#EF4444' : '#2563EB'}
                strokeDasharray="3 3"
                strokeWidth="1.5"
                x1={activePoint.x}
                x2={activePoint.x}
                y1={30}
                y2={baseY}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.yGross}
                r="5"
                fill="#38BDF8"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.yFraud}
                r="6.5"
                fill={
                  isPeak ||
                  activePoint.item.fraud_amount >=
                    (monthlyData[peakIndex]?.fraud_amount || 0) * 0.72
                    ? '#EF4444'
                    : '#2563EB'
                }
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Invisible interactive vertical hover triggers */}
          {points.map((p, idx) => (
            <rect
              key={p.item.Year_Month}
              x={p.x - 10}
              y={30}
              width="20"
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* Dynamic X-Axis Milestone Labels */}
          <g className="text-[11px] font-semibold">
            {xAxisMilestones.map((m, i) => (
              <text
                key={i}
                x={m.x}
                y={255}
                textAnchor={m.align}
                fill={m.isPeak ? '#EF4444' : '#64748B'}
                className={m.isPeak ? 'font-bold' : ''}
              >
                {m.label}
              </text>
            ))}
          </g>
        </svg>

        {/* Interactive Annotated Tooltip at Active Position */}
        {activePoint && (
          <div
            style={{
              left: `${Math.min(Math.max((activePoint.x / svgWidth) * 100, 18), 82)}%`,
              top: '10%'
            }}
            className="absolute -translate-x-1/2 p-3 rounded-xl bg-slate-900/95 backdrop-blur-sm text-white shadow-xl pointer-events-none flex flex-col gap-1 border border-slate-700/60 z-20 min-w-[190px]"
          >
            <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-700/60">
              <span className="text-xs font-bold text-sky-400">
                {activePoint.item.Year_Month} {isPeak ? 'Crest' : 'Snapshot'}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                  isPeak ||
                  activePoint.item.fraud_amount >=
                    (monthlyData[peakIndex]?.fraud_amount || 0) * 0.72
                    ? 'bg-red-600/90'
                    : 'bg-blue-600/90'
                }`}
              >
                {activePoint.item.total_amount > 0
                  ? ((activePoint.item.fraud_amount / activePoint.item.total_amount) * 100).toFixed(1)
                  : '0.0'}% Ratio
              </span>
            </div>
            <div className="text-[11px] flex items-center justify-between gap-4 text-slate-300">
              <span>Total Gross:</span>
              <span className="font-bold text-white tabular-nums">
                {fmtCurrency(activePoint.item.total_amount)}
              </span>
            </div>
            <div className="text-[11px] flex items-center justify-between gap-4 text-red-300">
              <span>Fraud Incident:</span>
              <span className="font-bold text-red-400 tabular-nums">
                {fmtCurrency(activePoint.item.fraud_amount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer KPI Bar */}
      <div className="pt-3 border-t border-slate-hairline flex flex-wrap items-center justify-between gap-3 text-xs text-slate-muted">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-body font-medium">Gross Volume Spline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-body font-medium">Baseline Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 rounded-full bg-red-600"></span>
            <span className="text-red-700 font-bold">Elevated Threat Crest</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-body">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-emerald-700">
            {monthlyData.length} Monthly Audit Cycles Aggregated
          </span>
        </div>
      </div>
    </div>
  );
};
