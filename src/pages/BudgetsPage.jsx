import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { budgetService } from '../services/budgetService.js';
import { Modal, ConfirmDialog } from '../components/app/Modal.jsx';
import BudgetCard from '../components/app/BudgetCard.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { SyncStatus } from '../components/app/SyncStatus.jsx';
import { formatINR, calculateBudgetStatus } from '../utils/format.js';
import api from '../services/api.js';

export default function BudgetsPage() {
  const toast = useToast();
  const [budgets, setBudgets] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [form, setForm] = useState({ Category: '', BudgetLimit: '' });
  const [categories, setCategories] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bs, db] = await Promise.all([budgetService.getAll(), api.get('/dashboard').catch(() => null)]);
      setBudgets(bs);
      setDashboard(db);
      setCategories((db && db.categories) || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (modalOpen && categories.length && !editing) {
      setForm((f) => ({ ...f, Category: f.Category || categories[0] }));
    }
  }, [modalOpen, categories, editing]);

  const openCreate = () => { setEditing(null); setForm({ Category: categories[0] || '', BudgetLimit: '' }); setModalOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ Category: b.Category, BudgetLimit: b.BudgetLimit }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limit = parseFloat(form.BudgetLimit);
    if (!form.Category) { toast.error('Select a category'); return; }
    if (isNaN(limit) || limit < 0) { toast.error('Enter a valid budget limit'); return; }
    setSyncStatus('saving');
    try {
      if (editing) {
        await budgetService.update(editing.ID, { Category: form.Category, BudgetLimit: limit });
        toast.success('Budget updated');
      } else {
        await budgetService.create({ Category: form.Category, BudgetLimit: limit });
        toast.success('Budget created');
      }
      setSyncStatus('saved');
      setTimeout(() => { setModalOpen(false); load(); }, 500);
    } catch (err) {
      setSyncStatus('error');
      toast.error(`Could not sync: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await budgetService.remove(deleting);
      toast.success('Budget deleted');
      setBudgets((prev) => prev.filter((b) => b.ID !== deleting));
      setDeleting(null);
    } catch (e) {
      toast.error(`Could not delete: ${e.message}`);
    }
  };

  const enriched = (budgets || []).map((b) => {
    const spent = (dashboard && dashboard.budgetStatus && dashboard.budgetStatus.find(x => x.ID === b.ID))?.spent || 0;
    const limit = parseFloat(b.BudgetLimit) || 0;
    return {
      ...b,
      spent,
      percentage: limit > 0 ? (spent / limit) * 100 : 0,
      status: calculateBudgetStatus(spent, limit),
    };
  });

  if (error) return <ErrorState title="Could not load budgets" message={error} onRetry={load} />;

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Budgets"
        subtitle="Set limits per category and know when to slow down."
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25"
          >
            <Plus size={16} /> Create Budget
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ListSkeleton key={i} rows={2} />)}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
          <EmptyState
            title="No budgets yet"
            message="Create category budgets to control your spending."
            icon={Pencil}
            action={
              <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
                <Plus size={16} /> Create Budget
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enriched.map((b) => (
            <BudgetCard key={b.ID} budget={b} onEdit={openEdit} onDelete={(id) => setDeleting(id)} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Budget' : 'Create Budget'}
        footer={
          <div className="flex items-center gap-3">
            <SyncStatus status={syncStatus} />
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
              <button type="submit" form="budget-form" disabled={syncStatus === 'saving'} className="px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-white disabled:opacity-60">
                {syncStatus === 'saving' ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        }
      >
        <form id="budget-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="budget-cat">Category</label>
            <select id="budget-cat" className={inputCls} value={form.Category} onChange={(e) => setForm({ ...form, Category: e.target.value })}>
              <option value="">Select category</option>
              {(categories.length ? categories : ['Food','Travel','Shopping','Entertainment','Recharge / Subscription','Education','Health','Friends / Outing','Bills','Others']).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="budget-limit">Budget Limit (₹)</label>
            <input id="budget-limit" type="number" min="0" className={inputCls} value={form.BudgetLimit} onChange={(e) => setForm({ ...form, BudgetLimit: e.target.value })} placeholder="e.g. 1500" />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Budget?"
        message="This will permanently remove this budget."
      />
    </div>
  );
}
