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
  X,
  Sparkles,
  Key,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

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
  const [dateDropdownOpen, setDateDropdownOpen] = useState(() => {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('openFilter') === 'true';
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [keyConfigStatus, setKeyConfigStatus] = useState<{ has_api_key: boolean; masked_key?: string } | null>(null);
  const [savingKey, setSavingKey] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState('');

  useEffect(() => {
    api.getApiKeyStatus().then(setKeyConfigStatus).catch(() => {});
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKeyInput.trim()) return;
    try {
      setSavingKey(true);
      const res = await api.saveApiKey(geminiKeyInput.trim());
      setKeyConfigStatus(res);
      setKeySavedMessage('Gemini API Key activated successfully!');
      setTimeout(() => setKeySavedMessage(''), 3000);
      setGeminiKeyInput('');
    } catch (err: any) {
      alert('Failed to save API key: ' + err.message);
    } finally {
      setSavingKey(false);
    }
  };

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
      'Gross Volume (INR),₹4151881350.42,Audited Ledger\n' +
      'Fraud Loss (INR),₹1052200974.24,25.34% of total value\n' +
      'Fraud Transactions,13473,5.39% incident rate\n' +
      'Legitimate Volume (INR),₹3099680376.18,74.66% settled\n' +
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
                    <span>₹18,87,057.16</span>
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

        {/* Gemini AI Status & Settings Trigger */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="h-9 px-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          title="Gemini AI Forensic Settings"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span className="hidden md:inline">Gemini AI</span>
          <span className={`w-2 h-2 rounded-full ${keyConfigStatus?.has_api_key ? 'bg-purple-600' : 'bg-emerald-500'}`}></span>
        </button>

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

      {/* Gemini AI Settings Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Gemini AI Forensic Engine</h3>
                  <p className="text-[11px] text-slate-500">Live Chart Analysis & Forensic Explanations</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Engine Status</span>
                  <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5 mt-0.5">
                    {keyConfigStatus?.has_api_key ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Google Gemini 1.5 Flash Active ({keyConfigStatus.masked_key})
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Built-in AI Forensic Engine Active (Zero Setup)
                      </>
                    )}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${keyConfigStatus?.has_api_key ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {keyConfigStatus?.has_api_key ? 'Live API' : 'Deterministic'}
                </span>
              </div>

              {keySavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {keySavedMessage}
                </div>
              )}

              {/* API Key Form */}
              <form onSubmit={handleSaveKey} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Gemini API Key (Optional)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      placeholder="Enter AIzaSy... to enable live Gemini API"
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    If omitted, the dashboard uses its built-in local deterministic AI engine. You do not need a key to run the dashboard.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-900 text-[11px] leading-relaxed">
                  💡 <strong>Prompt Optimization Guarantee:</strong> SentinelShield only transmits 5-8 summarized metrics per chart to Gemini (~100 tokens), satisfying strict quota constraints.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAiModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingKey || !geminiKeyInput.trim()}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{savingKey ? 'Saving...' : 'Save API Key'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
