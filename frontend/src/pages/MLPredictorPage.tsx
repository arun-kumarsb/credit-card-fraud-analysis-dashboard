import React from 'react';
import { Cpu, ShieldAlert, Sparkles, Clock, CheckCircle2, Lock } from 'lucide-react';

export const MLPredictorPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Scope Boundary Callout */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/30 border border-primary/40 text-primary-light text-xs font-bold uppercase tracking-wider mb-4">
            <Lock className="w-3.5 h-3.5" />
            Phase 2 Architecture Roadmap
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2">
            Custom Transaction Fraud Predictor
          </h3>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed mb-6">
            In strict compliance with academic Data Visualization Lab specifications, the current MVP focuses on empirical data engineering, statistical profiling, and interactive forensic visualization. Real-time machine-learning inference engines and SHAP explainability models are scheduled for deployment in Phase 2.
          </p>

          <div className="flex flex-wrap gap-4 text-xs">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Phase 1 (Active): 250k Ledger & Visual Analytics</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/20 backdrop-blur border border-amber-500/30 text-amber-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Phase 2 (Upcoming): XGBoost & Isolation Forest Inference</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Feature Blueprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl p-6 border border-slate-hairline shadow-ambient">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-heading mb-1">
            Planned Inference Pipeline
          </h4>
          <p className="text-xs text-slate-muted leading-relaxed">
            Gradient-boosted decision trees trained on verified historical vectors (amount-to-limit ratio, international anomalies, expired card velocity) to compute real-time risk probability scores (0.00 – 1.00).
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-slate-hairline shadow-ambient">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-heading mb-1">
            SHAP Explainability Vectors
          </h4>
          <p className="text-xs text-slate-muted leading-relaxed">
            Shapley additive explanations decomposing transaction risk scores into granular positive and negative feature attribution factors for analyst auditing.
          </p>
        </div>
      </div>

      {/* Lab Project Policy Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5">Strict Lab Ground Truth Enforcement:</strong>
          SentinelShield guarantees 100% data authenticity. Fabricated predictions, randomized mock scores, or synthetic inference results are strictly omitted to maintain scientific and forensic integrity.
        </div>
      </div>
    </div>
  );
};
