import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Bell,
  Search,
  Calendar,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X
} from 'lucide-react';

export interface DateRangeOption {
  id: string;
  label: string;
  startDate?: string;
  endDate?: string;
}

export const DATE_RANGES: DateRangeOption[] = [
  { id: 'all', label: 'All Time (2023 - 2026)', startDate: undefined, endDate: undefined },
  { id: '2023', label: 'Year 2023 (Jan - Dec)', startDate: '2023-01-01', endDate: '2023-12-31' },
  { id: '2024', label: 'Year 2024 (Jan - Dec)', startDate: '2024-01-01', endDate: '2024-12-31' },
  { id: '2025', label: 'Year 2025 (Jan - Dec)', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: '2026', label: 'Year 2026 (Jan - Aug)', startDate: '2026-01-01', endDate: '2026-08-31' },
  { id: 'recent12', label: 'Last 12 Months', startDate: '2025-09-01', endDate: '2026-08-31' },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedRangeId?: string;
  onDateRangeChange?: (range: DateRangeOption) => void;
  onSearchSubmit?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  selectedRangeId = 'all',
  onDateRangeChange,
  onSearchSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside & listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentRange = DATE_RANGES.find((r) => r.id === selectedRangeId) || DATE_RANGES[0];

  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const handleSelectRange = (range: DateRangeOption) => {
    setDateDropdownOpen(false);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const handleExportCSV = () => {
    setExportOpen(false);
    const csvContent =
      'Metric,Value,Note\n' +
      'Gross Volume,$4151881350.42,Audited Ledger\n' +
      'Fraud Loss,$1052200974.24,25.34% of total value\n' +
      'Fraud Transactions,13473,5.39% incident rate\n' +
      'Legitimate Volume,$3099680376.18,74.66% settled\n' +
      'Date Range,' + currentRange.label + ',Filtered View\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SentinelShield_Executive_Summary_${currentRange.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-surface border-b border-slate-hairline px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between sticky top-0 z-30 shadow-sm/50 gap-4">
      {/* Title & Subtitle */}
      <div className="min-w-[240px]">
        <h2 className="text-xl font-extrabold text-slate-heading tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Center Controls: Global Search & Date Range */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
        {/* Global Search Form */}
        <form onSubmit={handleSearchFormSubmit} className="relative flex-1">
          <button
            type="submit"
            title="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search txn ID, card, customer, city..."
            className="w-full h-9 pl-9 pr-14 rounded-xl border border-slate-hairline bg-slate-50 text-xs text-slate-heading placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (onSearchSubmit) onSearchSubmit('');
              }}
              title="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              title="Press Enter to search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200/60 hover:bg-primary hover:text-white text-[10px] font-mono text-slate-500 transition-colors"
            >
              ⌘K
            </button>
          )}
        </form>

        {/* Date Range Selector Dropdown */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="h-9 px-3 rounded-xl border border-slate-hairline bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-heading flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{currentRange.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-slate-hairline shadow-elevated py-1.5 z-40">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Filter Dataset Window
              </div>
              {DATE_RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRange(r)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    r.id === selectedRangeId
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-slate-body hover:bg-slate-50'
                  }`}
                >
                  <span>{r.label}</span>
                  {r.id === selectedRangeId && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Notifications, Export, Refresh, Academic Lab Tag */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl border border-slate-hairline bg-slate-50 hover:bg-slate-100 text-slate-muted hover:text-slate-heading transition-colors"
            title="Real-time Surveillance Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-slate-hairline shadow-elevated p-3 z-40">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-heading flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Critical Surveillance Alerts
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                  5 Unresolved
                </span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-red-50/60 border border-red-100">
                  <div className="flex justify-between font-bold text-red-700 text-[11px]">
                    <span>High-Value Outlier Flag</span>
                    <span>$1,887,057.16</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Unusual transaction pattern flagged in Uttar Pradesh (UP).
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-hairline">
                  <div className="flex justify-between font-bold text-slate-heading text-[11px]">
                    <span>Midnight Surge (00:00 - 04:00)</span>
                    <span className="text-indigo-600">840 txns/hr</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Elevated credential stuffing detected across Platinum card cluster.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Data Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="h-9 px-3 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary-dark transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-slate-hairline shadow-elevated py-1.5 z-40 text-xs">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-3.5 py-2 text-slate-body hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Executive Summary (CSV)</span>
                <span className="text-[10px] text-slate-400 font-mono">.csv</span>
              </button>
            </div>
          )}
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-hairline text-slate-muted hover:text-primary hover:bg-slate-50 transition duration-150 disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        )}

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Academic Lab Tag & Branding */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-heading">DV Lab</div>
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
