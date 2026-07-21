import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-slate-300 mb-4">
        {icon || <PackageOpen size={64} strokeWidth={1.2} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
