import React from 'react';
import { RefreshCw, Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="bg-surface border-b border-slate-hairline px-8 py-4.5 flex items-center justify-between sticky top-0 z-10 shadow-sm/50">
      <div>
        <h2 className="text-xl font-extrabold text-slate-heading tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick System Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-hairline text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-heading">Surveillance:</span>
          <span className="text-slate-muted font-medium">100% Validated Ledger</span>
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-hairline text-slate-muted hover:text-primary hover:bg-slate-50 transition duration-150 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        )}

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Academic Lab Tag */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-heading">Data Viz Lab</div>
            <div className="text-[10px] text-slate-muted">Academic MVP 2026</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
            SS
          </div>
        </div>
      </div>
    </header>
  );
};
