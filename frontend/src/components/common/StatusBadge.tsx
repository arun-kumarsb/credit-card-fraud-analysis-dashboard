import React from 'react';

interface StatusBadgeProps {
  status: string | number;
  type?: 'fraud' | 'risk' | 'status' | 'network' | 'card_mode';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  const str = String(status).toLowerCase();

  // Fraud status
  if (type === 'fraud' || str === '1' || str === 'fraud' || str === 'fraudulent') {
    if (str === '1' || str === 'fraud' || str === 'fraudulent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-light text-danger-dark border border-danger/20">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>
          FRAUD
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success-dark border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        Legitimate
      </span>
    );
  }

  // Risk levels
  if (str === 'high' || str === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-light text-danger-dark border border-danger/20">
        <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
        High Risk
      </span>
    );
  }
  if (str === 'medium' || str === 'moderate') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-amber-800 border border-warning/20">
        <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
        Medium Risk
      </span>
    );
  }
  if (str === 'low' || str === 'normal') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success-dark border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        Low Risk
      </span>
    );
  }

  // Operational status
  if (str === 'active' || str === 'successful') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        {status}
      </span>
    );
  }
  if (str === 'expired' || str === 'declined' || str === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        {status}
      </span>
    );
  }
  if (str === 'blocked' || str === 'lost' || str === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        {status}
      </span>
    );
  }

  // Generic pill
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
};
