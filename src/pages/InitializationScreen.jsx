import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, AlertTriangle, Wallet, RefreshCw } from 'lucide-react';

export default function InitializationScreen({ state, messages, onRetry }) {
  const navigate = useNavigate();
  const storageOk = state === 'ready';
  const hasError = state === 'error';

  useEffect(() => {
    if (state === 'ready') {
      const t = setTimeout(() => navigate('/app/dashboard', { replace: true }), 800);
      return () => clearTimeout(t);
    }
  }, [state, navigate]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white mb-6">
          <Wallet size={30} />
        </div>

        {hasError ? (
          <div className="bg-white dark:bg-navy-light border border-gray-100 dark:border-danger/30 rounded-2xl p-6">
            <AlertTriangle className="mx-auto text-danger mb-3" size={32} />
            <h2 className="text-navy dark:text-white font-semibold text-lg">Storage connection unavailable</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Pocket Money could not access the configured Supabase database.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={onRetry}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white"
              >
                <RefreshCw size={16} />
                Retry Connection
              </button>
              <a
                href="/app/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Skip for now
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-navy-light border border-gray-100 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-navy dark:text-white font-semibold text-lg">Preparing Pocket Money Tracker...</h2>
            <div className="mt-5 space-y-3 text-left">
              {messages.map((m, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  {m.done ? (
                    <Check className="text-success shrink-0" size={16} />
                  ) : i === messages.length - 1 && !m.done ? (
                    <Loader2 className="text-purple shrink-0 animate-spin" size={16} />
                  ) : (
                    <span className="w-4 shrink-0 text-gray-400 dark:text-gray-500">•</span>
                  )}
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-700"
                style={{ width: storageOk ? '100%' : '70%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
