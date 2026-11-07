import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse p-4">
      <div className="h-8 bg-slate-200 rounded-lg w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 bg-slate-200 rounded-2xl"></div>
        <div className="h-72 bg-slate-200 rounded-2xl"></div>
      </div>
      <div className="h-64 bg-slate-200 rounded-2xl"></div>
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="bg-surface rounded-2xl p-10 border border-danger/30 shadow-ambient text-center max-w-lg mx-auto my-12">
      <div className="w-14 h-14 bg-danger-light text-danger rounded-2xl flex items-center justify-center mx-auto mb-4 border border-danger/20 text-2xl font-bold">
        !
      </div>
      <h3 className="text-lg font-bold text-slate-heading mb-2">Service Error</h3>
      <p className="text-sm text-slate-body mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition shadow-sm"
        >
          Retry Request
        </button>
      )}
    </div>
  );
};
