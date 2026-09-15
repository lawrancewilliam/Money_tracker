import { useState } from 'react';
import { Menu, Plus, Cloud, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

export default function AppHeader({ onMenuClick, onQuickAdd, storageStatus = 'Synced', syncEvent }) {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncEvent();
      setTimeout(() => setSyncing(false), 1500);
    } catch (e) {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 px-4 lg:px-6 bg-white/80 dark:bg-navy/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
        <Cloud size={14} className={storageStatus === 'Connected' ? 'text-success' : 'text-warning'} />
        <span>{storageStatus === 'Connected' ? 'Google Drive synced' : `Storage: ${storageStatus}`}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate('/app/notifications')}
          className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
        <button
          onClick={handleSync}
          className={cn(
            'hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
            syncing
              ? 'text-purple border-purple/30 bg-purple/5'
              : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
          )}
        >
          <span className={syncing ? 'animate-spin inline-block' : ''}>
            <Cloud size={14} />
          </span>
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg gradient-bg text-white text-sm font-semibold shadow-lg shadow-purple/25 hover:opacity-95 active:scale-[0.98] transition"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>
    </header>
  );
}
