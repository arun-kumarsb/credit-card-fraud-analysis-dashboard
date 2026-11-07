import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'danger' | 'success' | 'warning' | 'primary' | 'neutral';
  };
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon,
  trend,
}) => {
  const getBadgeStyle = (variant: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-danger-light text-danger-dark border-danger/20';
      case 'success':
        return 'bg-success-light text-success-dark border-success/20';
      case 'warning':
        return 'bg-warning-light text-amber-800 border-warning/20';
      case 'primary':
        return 'bg-primary-light text-primary-dark border-primary/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-5 border border-slate-hairline shadow-ambient hover:shadow-elevated transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-heading tabular-nums">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-hairline flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-muted font-medium truncate">{subtitle}</span>
        )}
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full font-semibold border ${getBadgeStyle(
              badge.variant
            )}`}
          >
            {badge.text}
          </span>
        )}
        {trend && (
          <span
            className={`font-semibold flex items-center gap-0.5 ${
              trend.isPositive
                ? 'text-success'
                : trend.isPositive === false
                ? 'text-danger'
                : 'text-slate-muted'
            }`}
          >
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
