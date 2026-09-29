import { useState, useEffect, useCallback } from 'react';
import { Plus, Repeat, Pause, Play, Receipt } from 'lucide-react';
import { recurringService } from '../services/analyticsService.js';
import { expenseService } from '../services/expenseService.js';
import RecurringCard from '../components/app/RecurringCard.jsx';
import { Modal, ConfirmDialog } from '../components/app/Modal.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { SyncStatus } from '../components/app/SyncStatus.jsx';

const FREQ = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

const defaultForm = {
  ExpenseName: '',
  Amount: '',
  Category: '',
  Frequency: 'Monthly',
  StartDate: new Date().toISOString().slice(0, 10),
  NextPaymentDate: new Date().toISOString().slice(0, 10),
};

export default function RecurringPage() {
  const toast = useToast();
  const [recurring, setRecurring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringService.getAll();
      setRecurring(data);
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

  // Load categories from dashboard
  useEffect(() => {
    import('../services/api.js').then(({ default: api }) => {
      api.get('/dashboard').then((d) => {
        if (d.categories) setCategories(d.categories);
        else setCategories(['Food', 'Travel', 'Shopping', 'Entertainment', 'Recharge / Subscription', 'Education', 'Health', 'Friends / Outing', 'Bills', 'Others']);
      }).catch(() => {});
    });
  }, []);

  const openCreate = () => { setEditing(null); setForm({ ...defaultForm, Category: categories[0] || '', NextPaymentDate: new Date().toISOString().slice(0, 10) }); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      ExpenseName: r.ExpenseName,
      Amount: r.Amount,
      Category: r.Category,
      Frequency: r.Frequency,
      StartDate: r.StartDate,
      NextPaymentDate: r.NextPaymentDate,
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.Amount);
    if (!form.ExpenseName.trim()) { toast.error('Enter an expense name'); return; }
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSyncStatus('saving');
    try {
      if (editing) {
        await recurringService.update(editing.ID, { ...form, Amount: amt, ExpenseName: form.ExpenseName.trim() });
        toast.success('Recurring expense updated');
      } else {
        await recurringService.create({ ...form, Amount: amt, ExpenseName: form.ExpenseName.trim() });
        toast.success('Recurring expense created');
      }
      setSyncStatus('saved');
      setTimeout(() => { setModalOpen(false); load(); }, 500);
    } catch (err) {
      setSyncStatus('error');
      toast.error(`Could not sync: ${err.message}`);
    }
  };

  const togglePause = async (r) => {
    const newStatus = r.Status === 'Active' ? 'Paused' : 'Active';
    try {
      await recurringService.update(r.ID, { Status: newStatus });
      toast.success(newStatus === 'Paused' ? 'Paused' : 'Resumed');
      load();
    } catch (e) {
      toast.error(`Could not update: ${e.message}`);
    }
  };

  const addAsExpense = async (r) => {
    try {
      await expenseService.create({
        ExpenseName: r.ExpenseName,
        Amount: parseFloat(r.Amount),
        Category: r.Category,
        Date: new Date().toISOString().slice(0, 10),
        Time: new Date().toTimeString().slice(0, 5),
        PaymentMethod: 'Other',
        Notes: 'Recurring expense',
      });
      // compute next date
      let next = new Date(r.NextPaymentDate);
      const days = r.Frequency === 'Weekly' ? 7 : r.Frequency === 'Monthly' ? 30 : r.Frequency === 'Quarterly' ? 90 : 365;
      next.setDate(next.getDate() + days);
      await recurringService.update(r.ID, { NextPaymentDate: next.toISOString().slice(0, 10) });
      toast.success('Added as expense');
      load();
    } catch (e) {
      toast.error(`Could not add: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await recurringService.remove(deleting);
      toast.success('Recurring expense deleted');
      setRecurring((prev) => prev.filter((r) => r.ID !== deleting));
      setDeleting(null);
    } catch (e) {
      toast.error(`Could not delete: ${e.message}`);
    }
  };

  if (error) return <ErrorState title="Could not load recurring expenses" message={error} onRetry={load} />;

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recurring Expenses"
        subtitle="Track subscriptions and bills that repeat every month."
        action={
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
            <Plus size={16} /> Add Recurring
          </button>
        }
      />

      {loading ? (
        <ListSkeleton rows={4} />
      ) : !recurring || recurring.length === 0 ? (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
          <EmptyState
            title="No recurring expenses"
            message="Track subscriptions like Netflix, Spotify, and bills that repeat."
            icon={Repeat}
            action={
              <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
                <Plus size={16} /> Add Recurring
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurring.map((r) => (
            <RecurringCard
              key={r.ID}
              recurring={r}
              onEdit={openEdit}
              onDelete={(id) => setDeleting(id)}
              onPauseResume={togglePause}
              onAddAsExpense={addAsExpense}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
        footer={
          <div className="flex items-center gap-3">
            <SyncStatus status={syncStatus} />
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
              <button type="submit" form="recurring-form" disabled={syncStatus === 'saving'} className="px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-white disabled:opacity-60">
                {syncStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        }
      >
        <form id="recurring-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="rec-name">Expense Name</label>
            <input id="rec-name" className={inputCls} placeholder="e.g. Netflix" value={form.ExpenseName} onChange={(e) => setForm({ ...form, ExpenseName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="rec-amount">Amount (₹)</label>
              <input id="rec-amount" type="number" min="0" className={inputCls} placeholder="e.g. 199" value={form.Amount} onChange={(e) => setForm({ ...form, Amount: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="rec-freq">Frequency</label>
              <select id="rec-freq" className={inputCls} value={form.Frequency} onChange={(e) => setForm({ ...form, Frequency: e.target.value })}>
                {FREQ.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="rec-cat">Category</label>
            <select id="rec-cat" className={inputCls} value={form.Category} onChange={(e) => setForm({ ...form, Category: e.target.value })}>
              <option value="">Select category</option>
              {(categories.length ? categories : []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="rec-start">Start Date</label>
              <input id="rec-start" type="date" className={inputCls} value={form.StartDate} onChange={(e) => setForm({ ...form, StartDate: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="rec-next">Next Payment</label>
              <input id="rec-next" type="date" className={inputCls} value={form.NextPaymentDate} onChange={(e) => setForm({ ...form, NextPaymentDate: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Recurring Expense?"
        message="This will permanently remove this recurring expense."
      />
    </div>
  );
}
