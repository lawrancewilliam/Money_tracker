import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, PiggyBank } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { savingsService } from '../../services/savingsService.js';
import { formatINR } from '../../utils/format.js';

export default function SavingsTransactionForm({ open, onClose, onSaved, onError, currentSavings = 0 }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Deposit');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const amountNum = parseFloat(amount);
  const isValid = !isNaN(amountNum) && amountNum > 0 && !(type === 'Withdrawal' && amountNum > currentSavings);

  const reset = () => {
    setAmount('');
    setNotes('');
    setType('Deposit');
    setSaving(false);
    setErrorMsg('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await savingsService.addSavings({
        Date: new Date().toISOString().slice(0, 10),
        Type: type,
        Amount: amountNum,
        Notes: notes.trim(),
      });
      reset();
      onSaved();
    } catch (err) {
      setSaving(false);
      setErrorMsg(err.message || 'Could not save transaction');
      if (onError) onError(err.message || 'Could not save transaction');
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  const typeOptions = [
    { key: 'Deposit', label: 'Add Savings', display: 'Add Savings', icon: ArrowDownCircle, activeCls: 'bg-success/15 text-success border-success/40', alert: false },
    { key: 'Withdrawal', label: 'Withdraw Savings', display: 'Withdraw Savings', icon: ArrowUpCircle, activeCls: 'bg-danger/15 text-danger border-danger/40', alert: true },
  ];

  return (
    <Modal
      open={open}
      onClose={close}
      title={type === 'Withdrawal' ? 'Withdraw Savings' : 'Add to Savings'}
      footer={
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="savings-tx-form"
            disabled={!isValid || saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PiggyBank size={15} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      }
    >
      <form id="savings-tx-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Transaction Type</label>
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map(({ key, display, icon: Icon, activeCls }) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition ${
                  type === key ? activeCls : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {display}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="savings-amount">Amount (₹)</label>
          <input
            id="savings-amount"
            type="number"
            min="0"
            step="any"
            autoFocus
            className={inputCls}
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {type === 'Withdrawal' && (
          <p className="text-xs text-gray-400">
            Current savings: {formatINR(currentSavings)}.{" "}
            {amountNum > currentSavings ? (
              <span className="text-danger">Withdrawal cannot exceed your current savings.</span>
            ) : (
              "This reduces your total savings balance."
            )}
          </p>
        )}
        {type === 'Deposit' && (
          <p className="text-xs text-gray-400">Adds to your total savings balance.</p>
        )}

        <div>
          <label className={labelCls} htmlFor="savings-notes">Notes (optional)</label>
          <input
            id="savings-notes"
            className={inputCls}
            placeholder="e.g. Birthday money"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-danger bg-danger/5 border border-danger/10 rounded-xl px-3 py-2">{errorMsg}</p>
        )}
      </form>
    </Modal>
  );
}