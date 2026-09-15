import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, PiggyBank, Plus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const items = [
  { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/app/expenses', label: 'Expenses', icon: Receipt },
  { to: '/app/analytics', label: 'Stats', icon: PieChart },
  { to: '/app/savings', label: 'Savings', icon: PiggyBank },
];

export default function MobileBottomNav({ onQuickAdd }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-navy/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="relative grid grid-cols-5 items-center h-16">
        {items.map(({ to, label, icon: Icon }, i) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-medium relative z-10',
                isActive ? 'text-purple' : 'text-gray-400'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            onClick={onQuickAdd}
            className="w-14 h-14 rounded-full gradient-bg text-white flex items-center justify-center shadow-xl shadow-purple/30 active:scale-95 transition"
            aria-label="Add Expense"
          >
            <Plus size={26} />
          </button>
        </div>
      </div>
    </nav>
  );
}
