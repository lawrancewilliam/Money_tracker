import { useState, useEffect, useRef } from 'react';
import { RefreshCw, CloudOff } from 'lucide-react';

export function useSyncState() {
  const [state, setState] = useState({ status: 'idle', pending: [] });
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return { state, setState, online };
}

export function SyncStatus({ status }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <RefreshCw size={14} className="animate-spin" />
        Saving...
      </span>
    );
  }
  if (status === 'saved') {
    return <span className="inline-flex items-center gap-1.5 text-xs text-success">✓ Saved to Drive</span>;
  }
  if (status === 'error') {
    return <span className="inline-flex items-center gap-1.5 text-xs text-danger">⚠ Could not sync</span>;
  }
  if (status === 'pending') {
    return <span className="inline-flex items-center gap-1.5 text-xs text-warning">⏳ Pending Sync</span>;
  }
  return null;
}

export function OfflineBanner({ offline }) {
  if (!offline) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning text-sm font-medium rounded-xl mb-4">
      <CloudOff size={16} />
      You're offline. Changes will sync when connection returns.
    </div>
  );
}
