import { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { incomeService } from '../../services/incomeService.js';
import { useToast } from './Toast.jsx';
import { SyncStatus } from './SyncStatus.jsx';

const SOURCES = ['Part-Time', 'Freelance', 'Gift', 'Cashback', 'Refund', 'Other'];

export default function IncomeForm({ open, onClose, income, mode = 'income', onSaved, defaultPocketMoney }) {
  const isEdit = !!income;
  const toast = useToast();
  const [syncStatus, setSyncStatus] = useState('idle');

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    Source: SOURCES[0],
    Amount: '',
    Date: today,
    Notes: '',
    PocketMoney: defaultPocketMoney || '',
    ReceivedDate: today,
  });

  useEffect(() => {
    if (open) {
      if (income) {
        setForm({
          Source: income.Source || SOURCES[0],
          Amount: income.Amount || '',
          Date: income.Date || today,
          Notes: income.Notes || '',
          PocketMoney: defaultPocketMoney || '',
          ReceivedDate: today,
        });
      } else {
        setForm({
          Source: SOURCES[0],
          Amount: '',
          Date: today,
          Notes: '',
          PocketMoney: defaultPocketMoney || '',
          ReceivedDate: today,
        });
      }
      setSyncStatus('idle');
    }
  }, [open, income]);

  const update = (f, v) => setForm((s) => ({ ...s, [f]: v }));
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40 transition";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'pocketMoney') {
      const pocketMoneyAmount = Number(form.PocketMoney);
      if (!Number.isFinite(pocketMoneyAmount) || pocketMoneyAmount < 0) {
        toast.error('Enter a valid pocket money amount');
        return;
      }
      setSyncStatus('saving');
      try {
        await incomeService.setPocketMoney({ PocketMoney: pocketMoneyAmount, ReceivedDate: form.ReceivedDate });
        setSyncStatus('saved');
        toast.success('Pocket money saved to Drive');
        setTimeout(() => { onSaved && onSaved(); onClose(); }, 600);
      } catch (err) {
        setSyncStatus('error');
        toast.error(`Could not sync: ${err.message}`);
      }
      return;
    }

    const amt = parseFloat(form.Amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount greater than 0'); return; }
    if (!form.Date) { toast.error('Please select a date'); return; }

    setSyncStatus('saving');
    try {
      if (isEdit) {
        await incomeService.update(income.ID, { ...form, Amount: amt, Source: form.Source });
      } else {
        await incomeService.create({ ...form, Amount: amt, Source: form.Source });
      }
      setSyncStatus('saved');
      toast.success(isEdit ? 'Income updated' : 'Income added to Drive');
      setTimeout(() => { onSaved && onSaved(); onClose(); }, 600);
    } catch (err) {
      setSyncStatus('error');
      toast.error(`Could not sync: ${err.message}`);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === 'pocketMoney' ? 'Set Pocket Money'
        : isEdit ? 'Edit Income' : 'Add Income'
      }
      footer={
        <div className="flex items-center gap-3">
          <SyncStatus status={syncStatus} />
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="income-form"
              disabled={syncStatus === 'saving'}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-purple/25 hover:opacity-95 disabled:opacity-60 transition"
            >
              {syncStatus === 'saving' ? 'Saving...' : isEdit ? 'Save Changes' : 'Save'}
            </button>
          </div>
        </div>
      }
    >
      <form id="income-form" onSubmit={handleSubmit} className="space-y-4">
        {mode === 'pocketMoney' ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">Set your monthly pocket money for this month.</p>
            <div>
              <label className={labelCls} htmlFor="pm-amount">Monthly Pocket Money (₹)</label>
              <input
                id="pm-amount"
                type="number"
                min="0"
                step="0.01"
                required
                autoFocus
                className={inputCls}
                placeholder="e.g. 5000"
                value={form.PocketMoney}
                onChange={(e) => update('PocketMoney', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="pm-date">Received Date</label>
              <input
                id="pm-date"
                type="date"
                className={inputCls}
                value={form.ReceivedDate}
                onChange={(e) => update('ReceivedDate', e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelCls} htmlFor="inc-source">Source</label>
              <select
                id="inc-source"
                className={inputCls}
                value={form.Source}
                onChange={(e) => update('Source', e.target.value)}
              >
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="inc-amount">Amount (₹)</label>
              <input
                id="inc-amount"
                type="number"
                min="0"
                step="0.01"
                autoFocus
                className={inputCls}
                placeholder="0.00"
                value={form.Amount}
                onChange={(e) => update('Amount', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="inc-date">Date</label>
              <input
                id="inc-date"
                type="date"
                className={inputCls}
                value={form.Date}
                onChange={(e) => update('Date', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="inc-notes">Notes (optional)</label>
              <textarea
                id="inc-notes"
                className={`${inputCls} min-h-[60px] resize-none`}
                placeholder="Add a note..."
                value={form.Notes}
                onChange={(e) => update('Notes', e.target.value)}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
