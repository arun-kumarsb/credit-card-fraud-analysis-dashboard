import React from 'react';
import { X, ShieldAlert, CheckCircle2, User, CreditCard, Store, Clock, MapPin } from 'lucide-react';
import { TransactionDetail } from '../../types/api';
import { StatusBadge } from '../common/StatusBadge';

interface DrawerProps {
  transaction: TransactionDetail | null;
  onClose: () => void;
}

export const TransactionDetailDrawer: React.FC<DrawerProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-surface h-full shadow-2xl flex flex-col border-l border-slate-hairline transform transition-transform animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-hairline flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-slate-heading">
                {transaction.transaction_id}
              </span>
              <StatusBadge status={transaction.fraud_flag} type="fraud" />
            </div>
            <p className="text-xs text-slate-muted">
              {transaction.transaction_datetime} ({transaction.day_of_week})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-muted hover:text-slate-heading hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
          {/* Fraud Vector Alert Callout if Fraud */}
          {transaction.fraud_flag === 1 && (
            <div className="p-4 rounded-xl bg-danger-light border border-danger/30 text-danger-dark">
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                <ShieldAlert className="w-4 h-4 text-danger" />
                Fraud Vector Detected
              </div>
              <p className="font-semibold text-xs">{transaction.fraud_reason}</p>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-muted">
              Financial Breakdown
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-muted block">Transaction Amount</span>
                <span className="text-xl font-bold text-slate-heading tabular-nums">
                  ${transaction.transaction_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-muted block">Credit Limit Ratio</span>
                <span className="text-base font-bold text-slate-heading tabular-nums">
                  {(transaction.amount_to_limit_ratio * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Linked Customer Profile */}
          <div className="p-4 rounded-xl bg-surface border border-slate-hairline space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-muted flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              Cardholder Details
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-muted block">Customer ID</span>
                <span className="font-mono font-semibold text-slate-heading">{transaction.customer_id}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Cardholder Name</span>
                <span className="font-semibold text-slate-heading">{transaction.customer_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Occupation</span>
                <span className="font-medium text-slate-heading">{transaction.customer_occupation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Segment</span>
                <span className="font-semibold text-primary">{transaction.customer_segment || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-muted block">Billing Location</span>
                <span className="font-medium text-slate-heading">
                  {transaction.customer_city}, {transaction.customer_state}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Card Profile */}
          <div className="p-4 rounded-xl bg-surface border border-slate-hairline space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-muted flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Card Specifications
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-muted block">Card ID</span>
                <span className="font-mono font-semibold text-slate-heading">{transaction.card_id}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Card Network</span>
                <span className="font-semibold text-slate-heading">{transaction.card_network || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Card Tier & Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-medium">{transaction.card_type}</span>
                  <StatusBadge status={transaction.card_status || 'Active'} />
                </div>
              </div>
              <div>
                <span className="text-slate-muted block">Assigned Credit Limit</span>
                <span className="font-bold text-slate-heading tabular-nums">
                  ${transaction.card_credit_limit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Merchant Profile */}
          <div className="p-4 rounded-xl bg-surface border border-slate-hairline space-y-3">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-muted flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              Merchant Entity
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-muted block">Merchant ID</span>
                <span className="font-mono font-semibold text-slate-heading">{transaction.merchant_id}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Merchant Name</span>
                <span className="font-semibold text-slate-heading">{transaction.merchant_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-muted block">MCC Category</span>
                <span className="font-medium text-slate-heading">{transaction.merchant_category}</span>
              </div>
              <div>
                <span className="text-slate-muted block">Risk Level & Rating</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StatusBadge status={transaction.merchant_risk_level} type="risk" />
                  <span className="text-amber-600 font-bold">★ {transaction.merchant_rating || 'N/A'}</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-muted block">Merchant Location</span>
                <span className="font-medium text-slate-heading">
                  {transaction.merchant_city}, {transaction.merchant_state}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Vector Attributes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-hairline space-y-2">
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-muted">
              Vector Telemetry
            </h5>
            <div className="grid grid-cols-2 gap-2 text-slate-body">
              <div>Channel: <strong>{transaction.transaction_channel}</strong></div>
              <div>Device: <strong>{transaction.device_type}</strong></div>
              <div>Payment Rail: <strong>{transaction.payment_method}</strong></div>
              <div>Status: <strong>{transaction.transaction_status}</strong></div>
              <div>International: <strong>{transaction.is_international ? 'Yes (Cross-border)' : 'No (Domestic)'}</strong></div>
              <div>Time Period: <strong>{transaction.time_period}</strong></div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-hairline bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 text-slate-heading font-semibold text-xs hover:bg-slate-300 transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
