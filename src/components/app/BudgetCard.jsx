import { Pencil, Trash2 } from 'lucide-react';
import ProgressBar from '../reactbits/ProgressBar.jsx';
import { cn } from '../../utils/cn.js';

const statusStyles = {
  Safe: 'bg-success/10 text-success',
  'Approaching Limit': 'bg-warning/10 text-warning',
  'Almost Exhausted': 'bg-warning/10 text-warning',
  Exceeded: 'bg-danger/10 text-danger',
};

const statusColors = {
  Safe: '#10B981',
  'Approaching Limit': '#F59E0B',
  'Almost Exhausted': '#F59E0B',
  Exceeded: '#EF4444',
};

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const { Category, BudgetLimit, spent, percentage, status, ID } = budget;
  const pct = Math.min(percentage || 0, 100);
  const barColor = statusColors[status] || '#10B981';

  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-navy dark:text-white">{Category}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            ₹{Number(spent || 0).toLocaleString('en-IN')} / ₹{Number(BudgetLimit).toLocaleString('en-IN')}
          </p>
        </div>
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', statusStyles[status] || statusStyles.Safe)}>
          {status}
        </span>
      </div>

      <ProgressBar progress={pct} color={barColor} height={8} />

      <p className="text-right text-xs text-gray-400 mt-1.5">{Math.round(pct)}% used</p>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-violet hover:bg-violet/10 transition-colors"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(ID)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
