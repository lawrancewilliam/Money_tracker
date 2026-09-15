import { useState } from 'react';
import { AlertTriangle, Trash2, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal.jsx';

const RESET_OPTIONS = [
  { key: 'PocketMoney', label: 'Pocket Money' },
  { key: 'Income', label: 'Income' },
  { key: 'Expenses', label: 'Expenses' },
  { key: 'Budgets', label: 'Budgets' },
  { key: 'SavingsGoals', label: 'Savings Goals' },
  { key: 'SavingsTransactions', label: 'Savings Transactions' },
  { key: 'RecurringExpenses', label: 'Recurring Expenses' },
  { key: 'Notifications', label: 'Notifications' },
];

export default function ResetModal({ onClose, onConfirm, resetting }) {
  const [selected, setSelected] = useState(() => new Set(RESET_OPTIONS.map((o) => o.key)));

  const allSelected = RESET_OPTIONS.every((o) => selected.has(o.key));
  const anySelected = selected.size > 0;

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(RESET_OPTIONS.map((o) => o.key)));
  };

  const confirm = () => {
    if (!anySelected || resetting) return;
    onConfirm([...selected]);
  };

  const checkboxCls = "accent-purple w-4 h-4 rounded focus:ring-purple/40";
  const rowCls = "flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-purple/30 transition cursor-pointer select-none";
  const labelCls = "text-sm font-medium text-navy dark:text-white cursor-pointer";

  return (
    <Modal
      open
      onClose={onClose}
      title="Reset Pocket Money Data?"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={resetting}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!anySelected || resetting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-danger hover:bg-red-600 shadow-lg shadow-danger/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
            {resetting ? 'Resetting...' : 'Reset Data'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-danger/5 border border-danger/10">
          <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This will permanently remove your financial data from the connected Google Sheet. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck size={15} className="text-success shrink-0" />
          <span>Categories and app settings will be preserved.</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/10">
          <label className={`${rowCls} !py-2`}>
            <input
              type="checkbox"
              className={checkboxCls}
              checked={allSelected}
              onChange={toggleAll}
            />
            <span className="text-sm font-semibold text-navy dark:text-white cursor-pointer">Select All</span>
          </label>
          {!allSelected && (
            <span className="text-xs text-gray-400">{selected.size} of {RESET_OPTIONS.length} selected</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RESET_OPTIONS.map((o) => (
            <label
              key={o.key}
              className={`${rowCls} ${selected.has(o.key) ? '' : 'opacity-70'}`}
            >
              <input
                type="checkbox"
                className={checkboxCls}
                checked={selected.has(o.key)}
                onChange={() => toggle(o.key)}
              />
              <span className={labelCls}>{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}