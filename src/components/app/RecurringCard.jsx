import { Pencil, Trash2, Pause, Play, PlusCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const statusStyles = {
  Active: 'bg-success/10 text-success',
  Paused: 'bg-gray-100 dark:bg-white/10 text-gray-400',
  Due: 'bg-warning/10 text-warning',
};

const frequencyLabels = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  Monthly: 'Monthly',
  Yearly: 'Yearly',
};

export default function RecurringCard({ recurring, onEdit, onDelete, onPauseResume, onAddAsExpense }) {
  const { ID, ExpenseName, Amount, Category, Frequency, NextPaymentDate, Status } = recurring;
  const isPaused = Status === 'Paused';

  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-navy dark:text-white">{ExpenseName}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{Category}</p>
        </div>
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', statusStyles[Status] || statusStyles.Active)}>
          {Status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
        <div>
          <span className="text-xs text-gray-400">Amount</span>
          <p className="font-semibold text-navy dark:text-white">₹{Number(Amount).toLocaleString('en-IN')}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Frequency</span>
          <p className="font-medium text-navy dark:text-white">{frequencyLabels[Frequency] || Frequency}</p>
        </div>
        <div className="col-span-2">
          <span className="text-xs text-gray-400">Next Payment</span>
          <p className={cn('font-medium', NextPaymentDate ? 'text-navy dark:text-white' : 'text-gray-400')}>
            {NextPaymentDate || 'Not set'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
        {onAddAsExpense && (
          <button
            onClick={() => onAddAsExpense(ID)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-success hover:bg-success/10 transition-colors"
          >
            <PlusCircle size={13} /> Add Expense
          </button>
        )}
        {onPauseResume && (
          <button
            onClick={() => onPauseResume(ID, !isPaused)}
            className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', isPaused ? 'text-success hover:bg-success/10' : 'text-warning hover:bg-warning/10')}
          >
            {isPaused ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(recurring)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-violet hover:bg-violet/10 transition-colors"
          >
            <Pencil size={13} /> Edit
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
