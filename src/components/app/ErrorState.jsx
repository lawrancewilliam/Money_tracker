import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

export default function ErrorState({ title, message, onRetry, showSetupHelp }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4">
        <AlertTriangle size={28} />
      </div>
      <h3 className="font-semibold text-navy dark:text-white text-lg">{title || 'Something went wrong'}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-sm">{message}</p>
      <div className="flex gap-3 mt-6">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-navy text-white dark:bg-white dark:text-navy hover:opacity-90 transition"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        )}
        {showSetupHelp && (
          <button
            onClick={showSetupHelp}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            <ExternalLink size={16} />
            Setup Help
          </button>
        )}
      </div>
    </div>
  );
}
