import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, CloudOff } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const toast = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    warn: (m) => push('warn', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-[60] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-navy-light shadow-lg border border-gray-100 dark:border-white/10 text-sm animate-[toastIn_0.25s_ease]"
          >
            {t.type === 'success' && <CheckCircle2 size={18} className="text-success shrink-0" />}
            {t.type === 'error' && <CloudOff size={18} className="text-danger shrink-0" />}
            {t.type === 'warn' && <AlertTriangle size={18} className="text-warning shrink-0" />}
            {t.type === 'info' && <Info size={18} className="text-violet shrink-0" />}
            <span className="text-navy dark:text-white flex-1">{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform: translateY(0);} }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
