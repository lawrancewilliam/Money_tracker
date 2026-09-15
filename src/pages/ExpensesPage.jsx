import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Copy, Receipt } from 'lucide-react';
import { expenseService } from '../services/expenseService.js';
import ExpenseForm from '../components/app/ExpenseForm.jsx';
import { ConfirmDialog } from '../components/app/Modal.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { formatINR, formatDate } from '../utils/format.js';
import api from '../services/api.js';

export default function ExpensesPage() {
  const toast = useToast();
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [exp, cat] = await Promise.all([
        expenseService.getAll(),
        api.get('/dashboard').catch(() => ({ categories: [] })),
      ]);
      setExpenses(exp);
      setCategories(cat.categories || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await expenseService.remove(deleting.ID);
      toast.success('Expense deleted');
      setExpenses((prev) => prev.filter((e) => e.ID !== deleting.ID));
      setDeleting(null);
    } catch (e) {
      toast.error(`Could not delete: ${e.message}`);
    }
  };

  const duplicate = async (exp) => {
    try {
      await expenseService.create({
        ExpenseName: exp.ExpenseName,
        Amount: exp.Amount,
        Category: exp.Category,
        Date: new Date().toISOString().slice(0, 10),
        Time: new Date().toTimeString().slice(0, 5),
        PaymentMethod: exp.PaymentMethod,
        Notes: exp.Notes || '',
      });
      toast.success('Expense duplicated');
      load();
    } catch (e) {
      toast.error(`Could not duplicate: ${e.message}`);
    }
  };

  if (error) return <ErrorState title="Could not load expenses" message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Expenses"
        subtitle="Track everything you spend this month."
        action={
          <button
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25"
          >
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      {loading ? (
        <ListSkeleton rows={6} />
      ) : !expenses || expenses.length === 0 ? (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
          <EmptyState
            title="No expenses yet"
            message="Add your first expense to start tracking your spending."
            icon={Receipt}
            action={
              <button
                onClick={() => { setEditing(null); setFormOpen(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25"
              >
                <Plus size={16} /> Add Expense
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {expenses.map((e) => (
              <div key={e.ID} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition">
                <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                  <Receipt size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-navy dark:text-white truncate">{e.ExpenseName}</p>
                  <p className="text-xs text-gray-400">
                    {e.Category} · {e.PaymentMethod} · {formatDate(e.Date)}{e.Time ? ` · ${e.Time}` : ''}
                  </p>
                  {e.Notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{e.Notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-danger">−{formatINR(e.Amount)}</span>
                  <button onClick={() => duplicate(e)} className="p-2 rounded-lg text-gray-400 hover:text-violet hover:bg-violet/10" aria-label="Duplicate">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => { setEditing(e); setFormOpen(true); }} className="p-2 rounded-lg text-gray-400 hover:text-violet hover:bg-violet/10" aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleting(e)} className="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {formOpen && (
        <ExpenseForm
          open
          onClose={() => setFormOpen(false)}
          expense={editing}
          categories={categories.length ? categories : undefined}
          onSaved={load}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Expense?"
        message="This will permanently remove this expense from your tracker."
      />
    </div>
  );
}
