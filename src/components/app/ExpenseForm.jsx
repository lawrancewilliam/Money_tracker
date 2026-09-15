import { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { expenseService } from '../../services/expenseService.js';
import { useToast } from './Toast.jsx';
import { SyncStatus } from './SyncStatus.jsx';

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Other'];

export const DEFAULT_CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Entertainment', 'Recharge / Subscription',
  'Education', 'Health', 'Friends / Outing', 'Bills', 'Others',
];

export default function ExpenseForm({ open, onClose, expense, categories = DEFAULT_CATEGORIES, onSaved, defaultPaymentMethod }) {
  const isEdit = !!expense;
  const toast = useToast();
  const [syncStatus, setSyncStatus] = useState('idle');

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    ExpenseName: '',
    Amount: '',
    Category: categories[0] || 'Food',
    Date: today,
    Time: nowTime,
    PaymentMethod: defaultPaymentMethod || 'UPI',
    Notes: '',
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        setForm({
          ExpenseName: expense.ExpenseName || '',
          Amount: expense.Amount || '',
          Category: expense.Category || categories[0] || 'Food',
          Date: expense.Date || today,
          Time: expense.Time || nowTime,
          PaymentMethod: expense.PaymentMethod || defaultPaymentMethod || 'UPI',
          Notes: expense.Notes || '',
        });
      } else {
        setForm({
          ExpenseName: '',
          Amount: '',
          Category: categories[0] || 'Food',
          Date: today,
          Time: nowTime,
          PaymentMethod: defaultPaymentMethod || 'UPI',
          Notes: '',
        });
      }
      setSyncStatus('idle');
    }
  }, [open, expense]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.Amount);
    if (!form.ExpenseName.trim()) { toast.error('Please enter an expense name'); return; }
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount greater than 0'); return; }

    setSyncStatus('saving');
    try {
      if (isEdit) {
        await expenseService.update(expense.ID, {
          ...form,
          Amount: amt,
          ExpenseName: form.ExpenseName.trim(),
        });
      } else {
        await expenseService.create({
          ...form,
          Amount: amt,
          ExpenseName: form.ExpenseName.trim(),
        });
      }
      setSyncStatus('saved');
      toast.success(isEdit ? 'Expense updated' : 'Expense saved to Drive');
      setTimeout(() => {
        onSaved && onSaved();
        onClose();
      }, 600);
    } catch (err) {
      setSyncStatus('error');
      toast.error(`Could not sync: ${err.message}`);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 transition";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Expense' : 'Add Expense'}
      footer={
        <div className="flex items-center gap-3">
          <SyncStatus status={syncStatus} />
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="expense-form"
              disabled={syncStatus === 'saving'}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-purple/25 hover:opacity-95 disabled:opacity-60 transition"
            >
              {syncStatus === 'saving' ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </div>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="expense-name">Expense Name</label>
          <input
            id="expense-name"
            autoFocus
            className={inputCls}
            placeholder="e.g. Lunch"
            value={form.ExpenseName}
            onChange={(e) => update('ExpenseName', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="expense-amount">Amount (₹)</label>
          <input
            id="expense-amount"
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            placeholder="0.00"
            value={form.Amount}
            onChange={(e) => update('Amount', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="expense-category">Category</label>
          <select
            id="expense-category"
            className={inputCls}
            value={form.Category}
            onChange={(e) => update('Category', e.target.value)}
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="expense-date">Date</label>
            <input
              id="expense-date"
              type="date"
              className={inputCls}
              value={form.Date}
              onChange={(e) => update('Date', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="expense-time">Time</label>
            <input
              id="expense-time"
              type="time"
              className={inputCls}
              value={form.Time}
              onChange={(e) => update('Time', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="expense-method">Payment Method</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update('PaymentMethod', m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  form.PaymentMethod === m
                    ? 'gradient-bg text-white border-transparent'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="expense-notes">Notes (optional)</label>
          <textarea
            id="expense-notes"
            className={`${inputCls} min-h-[70px] resize-none`}
            placeholder="Add a note..."
            value={form.Notes}
            onChange={(e) => update('Notes', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
