import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full ${sizes[size]} bg-white dark:bg-navy-light rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-semibold text-navy dark:text-white text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition ${
              danger ? 'bg-danger hover:bg-red-600' : 'gradient-bg hover:opacity-95'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </Modal>
  );
}
