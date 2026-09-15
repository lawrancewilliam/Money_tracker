import { AlertTriangle, Clock, Target, Info, Check, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const typeIcons = {
  BudgetExceeded: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
  LowBalance: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  RecurringDue: { icon: Clock, color: 'text-violet', bg: 'bg-violet/10' },
  SavingsGoal: { icon: Target, color: 'text-pink', bg: 'bg-pink/10' },
  default: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-white/5' },
};

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
  const { ID, Date, Type, Message, ReadStatus } = notification;
  const isUnread = ReadStatus !== 'Read';
  const config = typeIcons[Type] || typeIcons.default;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'bg-white dark:bg-navy-light rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 transition-shadow hover:shadow-md',
        isUnread && 'border-l-4 border-l-violet'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-xl shrink-0', config.bg)}>
          <Icon size={16} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm text-navy dark:text-white leading-relaxed', isUnread && 'font-semibold')}>{Message}</p>
          <p className="text-xs text-gray-400 mt-1">{Date}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
        {onMarkRead && isUnread && (
          <button
            onClick={() => onMarkRead(ID)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-success hover:bg-success/10 transition-colors"
          >
            <Check size={13} /> Mark Read
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(ID)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
