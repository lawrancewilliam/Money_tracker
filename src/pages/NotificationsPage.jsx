import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { notificationService } from '../services/analyticsService.js';
import NotificationCard from '../components/app/NotificationCard.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';

export default function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    try {
      const res = await notificationService.generate();
      toast.success(`${res.generated} new notification${res.generated === 1 ? '' : 's'}`);
      load();
    } catch (e) {
      toast.error(`Could not generate: ${e.message}`);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n.ID === id ? { ...n, ReadStatus: 'Read' } : n));
    } catch (e) {
      toast.error('Could not mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, ReadStatus: 'Read' })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Could not mark all as read');
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.remove(id);
      setNotifications((prev) => prev.filter((n) => n.ID !== id));
    } catch (e) {
      toast.error('Could not delete notification');
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (e) {
      toast.error('Could not clear notifications');
    }
  };

  const unreadCount = (notifications || []).filter((n) => n.ReadStatus !== 'Read').length;

  if (error) return <ErrorState title="Could not load notifications" message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Stay on top of budgets, balances and recurring expenses."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={generate} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
              <RefreshCw size={15} /> Generate
            </button>
            <button onClick={markAllRead} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
              <CheckCheck size={15} /> Mark All Read
            </button>
            <button onClick={clearAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-danger hover:bg-danger/5">
              <Trash2 size={15} /> Clear All
            </button>
          </div>
        }
      />

      {unreadCount > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-violet/10 text-violet text-sm font-medium">
          {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={5} />
      ) : !notifications || notifications.length === 0 ? (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
          <EmptyState
            title="No notifications"
            message="Notifications will appear here when budgets get close to their limits or balances run low."
            icon={Bell}
            action={
              <button onClick={generate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
                <RefreshCw size={16} /> Generate Now
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              onMarkRead={markRead}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}