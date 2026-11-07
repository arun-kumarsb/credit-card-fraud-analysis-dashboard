import React from 'react';
import {
  ShieldAlert,
  BarChart3,
  Receipt,
  Users,
  CreditCard,
  Store,
  Cpu,
  ShieldCheck,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      subtitle: 'Overall Synthesis',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'transactions',
      label: 'Transactions Explorer',
      subtitle: '250k Ledger Stream',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'customers',
      label: 'Customer Analytics',
      subtitle: 'Demographic Vectors',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'cards',
      label: 'Cards Portfolio',
      subtitle: 'Lifecycle & Networks',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'merchants',
      label: 'Merchant Ecosystem',
      subtitle: 'MCC Anomaly Indices',
      icon: <Store className="w-5 h-5" />,
    },
    {
      id: 'predictor',
      label: 'ML Fraud Predictor',
      subtitle: 'Phase 2 (Inference)',
      icon: <Cpu className="w-5 h-5" />,
      badge: 'Phase 2',
    },
    {
      id: 'quality',
      label: 'Data Quality & Audit',
      subtitle: 'Pipeline Integrity',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-slate-hairline flex flex-col shrink-0 min-h-screen z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-hairline flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-heading tracking-tight leading-tight">
            SentinelShield
          </h1>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-primary">
            Fraud Analytics
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-muted">
          Analytics Hub
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary text-white font-semibold shadow-sm shadow-primary/25'
                  : 'text-slate-body hover:bg-slate-50 hover:text-slate-heading font-medium'
              }`}
            >
              <div
                className={`transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-muted group-hover:text-primary'
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate leading-snug">{item.label}</div>
                <div
                  className={`text-[11px] truncate ${
                    isActive ? 'text-primary-light/80' : 'text-slate-muted'
                  }`}
                >
                  {item.subtitle}
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Database & Runtime Footprint */}
      <div className="p-4 border-t border-slate-hairline m-3 bg-slate-50 rounded-2xl border">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-heading">Local SQLite Active</span>
        </div>
        <div className="text-[11px] text-slate-muted space-y-1">
          <div className="flex justify-between">
            <span>Ledger:</span>
            <span className="font-semibold text-slate-body tabular-nums">250,000 Txns</span>
          </div>
          <div className="flex justify-between">
            <span>Database:</span>
            <span className="font-mono text-[10px] text-slate-muted">sentinelshield.db</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200 text-emerald-700 font-semibold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FASTAPI RUNNING (PORT 8000)
          </div>
        </div>
      </div>
    </aside>
  );
};
