import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Wallet, ArrowDownCircle, PiggyBank } from 'lucide-react';
import { incomeService } from '../services/incomeService.js';
import IncomeForm from '../components/app/IncomeForm.jsx';
import { ConfirmDialog } from '../components/app/Modal.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { formatINR, formatDate } from '../utils/format.js';
import StatCard from '../components/app/StatCard.jsx';

export default function IncomePage() {
  const toast = useToast();
  const [income, setIncome] = useState(null);
  const [pocketMoney, setPocketMoney] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mode, setMode] = useState('income');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await incomeService.getAll();
      setIncome(data);
      setPocketMoney(data[0]?.PocketMoney || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openForm = (m, rec) => {
    setMode(m);
    setEditing(rec);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await incomeService.remove(deleting.ID);
      toast.success('Income deleted');
      setIncome((prev) => prev.filter((i) => i.ID !== deleting.ID));
      setDeleting(null);
    } catch (e) {
      toast.error(`Could not delete: ${e.message}`);
    }
  };

  if (error) return <ErrorState title="Could not load income" message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Income"
        subtitle="Track your pocket money and additional income."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => openForm('pocketMoney')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <Wallet size={16} /> Set Pocket Money
            </button>
            <button
              onClick={() => openForm('income')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25"
            >
              <Plus size={16} /> Add Income
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Pocket Money (This Month)" value={pocketMoney} icon={Wallet} color="violet" />
        <StatCard
          label="This Month's Extra Income"
          value={(income || []).filter(i => !i.Source || i.Source !== '0').reduce((s, i) => s + (parseFloat(i.Amount) || 0), 0)}
          icon={ArrowDownCircle}
          color="success"
        />
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : !income || income.length === 0 ? (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
          <EmptyState
            title="No income recorded"
            message="Set your monthly pocket money to get started."
            icon={PiggyBank}
            action={
              <button
                onClick={() => openForm('pocketMoney')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25"
              >
                <Wallet size={16} /> Set Pocket Money
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {income.map((i) => (
              <div key={i.ID} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <ArrowDownCircle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-navy dark:text-white">{i.Source || 'Additional Income'}</p>
                  <p className="text-xs text-gray-400">{formatDate(i.Date)}{i.Notes ? ` · ${i.Notes}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-success">+{formatINR(i.Amount)}</span>
                  <button onClick={() => openForm('income', i)} className="p-2 rounded-lg text-gray-400 hover:text-violet hover:bg-violet/10" aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleting(i)} className="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {formOpen && (
        <IncomeForm
          open
          income={editing}
          mode={mode}
          onClose={() => setFormOpen(false)}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Income?"
        message="This will permanently remove this income record."
      />
    </div>
  );
}
