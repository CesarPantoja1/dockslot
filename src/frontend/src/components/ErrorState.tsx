import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-red-400 mb-4">
        <AlertTriangle size={56} strokeWidth={1.2} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
