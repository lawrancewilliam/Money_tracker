import { Plus, Minus, Pencil, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn.js';

function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function SavingsGoalCard({ goal, onAddMoney, onWithdraw, onEdit, onDelete, onToggleComplete }) {
  const { ID, GoalName, TargetAmount, TargetDate, Status, Icon, SavedAmount, Description } = goal;
  const target = Number(TargetAmount) || 0;
  const saved = Number(SavedAmount) || 0;
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const remaining = Math.max(target - saved, 0);
  const days = daysRemaining(TargetDate);
  const isComplete = Status === 'Completed' || pct >= 100;

  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div
          className="relative w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: `conic-gradient(#6C4BFF ${pct * 3.6}deg, #E5E7EB ${pct * 3.6}deg)`,
          }}
        >
          <div className="absolute inset-[3px] rounded-full bg-white dark:bg-navy-light flex items-center justify-center">
            <span className="text-2xl">{Icon || '🎯'}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-navy dark:text-white truncate">{GoalName}</h4>
            {isComplete && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Done</span>
            )}
          </div>
          {Description && <p className="text-xs text-gray-400 mt-0.5 truncate">{Description}</p>}
          <p className="text-sm font-medium text-navy dark:text-white mt-1.5">
            ₹{saved.toLocaleString('en-IN')} <span className="text-gray-400 font-normal">/ ₹{target.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{Math.round(pct)}% saved</p>
          {remaining > 0 && (
            <p className="text-xs text-gray-400">₹{remaining.toLocaleString('en-IN')} remaining</p>
          )}
          {days !== null && (
            <p className={cn('text-xs mt-0.5', days < 0 ? 'text-danger' : days <= 7 ? 'text-warning' : 'text-gray-400')}>
              {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days left`}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
        {onAddMoney && !isComplete && (
          <button
            onClick={() => onAddMoney(ID)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-success hover:bg-success/10 transition-colors"
          >
            <Plus size={13} /> Add
          </button>
        )}
        {onWithdraw && !isComplete && saved > 0 && (
          <button
            onClick={() => onWithdraw(ID)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-warning hover:bg-warning/10 transition-colors"
          >
            <Minus size={13} /> Withdraw
          </button>
        )}
        {onToggleComplete && (
          <button
            onClick={() => onToggleComplete(ID, !isComplete)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-violet hover:bg-violet/10 transition-colors"
          >
            {isComplete ? <><RotateCcw size={13} /> Reactivate</> : <><CheckCircle2 size={13} /> Complete</>}
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(goal)}
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
