import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, ArrowLeftRight, ArrowDownCircle, PiggyBank,
  Wallet, PieChart, CalendarDays, Repeat, Sparkles, Bell, Settings, Cloud,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/expenses', label: 'Expenses', icon: Receipt },
  { to: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/app/income', label: 'Income', icon: ArrowDownCircle },
  { to: '/app/budgets', label: 'Budgets', icon: Wallet },
  { to: '/app/savings', label: 'Savings', icon: PiggyBank },
  { to: '/app/analytics', label: 'Analytics', icon: PieChart },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/recurring', label: 'Recurring', icon: Repeat },
  { to: '/app/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar({ open, onClose, storageStatus = 'connecting' }) {
  const connected = storageStatus === 'Connected';
  const badge = connected ? 'Synced' : storageStatus === 'Error' ? 'Error' : storageStatus === 'connecting' ? 'Connecting' : storageStatus;
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-navy/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-[100dvh] w-64 shrink-0 flex-col bg-white dark:bg-navy border-r border-gray-100 dark:border-white/5 flex transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-100 dark:border-white/5">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white">
            <Wallet size={18} />
          </div>
          <div>
            <div className="font-bold text-navy dark:text-white leading-none">Pocket Money</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Smart Budget Tracker</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              end={to === '/app/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'gradient-bg text-white shadow-lg shadow-purple/25'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-white/5">
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium', connected ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
            <Cloud size={14} />
            Storage
            <span className={cn('ml-auto', connected ? 'text-success' : storageStatus === 'Error' ? 'text-danger' : 'text-warning')}>{badge}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
