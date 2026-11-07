import React, { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  height?: number | string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  height = 260,
}) => {
  return (
    <div
      className={`bg-surface rounded-2xl p-6 border border-slate-hairline shadow-ambient flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-slate-heading tracking-tight">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="w-full" style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: typeof height === 'number' ? `${height}px` : height }}>
        {children}
      </div>
    </div>
  );
};
