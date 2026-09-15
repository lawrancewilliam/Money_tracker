import { useState, useEffect, useCallback } from 'react';
import { Plus, Target, PiggyBank, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { savingsService } from '../services/savingsService.js';
import SavingsGoalCard from '../components/app/SavingsGoalCard.jsx';
import SavingsTransactionForm from '../components/app/SavingsTransactionForm.jsx';
import { Modal, ConfirmDialog } from '../components/app/Modal.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { SyncStatus } from '../components/app/SyncStatus.jsx';
import { formatINR } from '../utils/format.js';
import StatCard from '../components/app/StatCard.jsx';

const ICONS = ['🎯', '🎧', '📱', '🎮', '✈️', '🚗', '💻', '🛍️', '🎸', '🏆', '🐷'];

const defaultForm = {
  GoalName: '',
  TargetAmount: '',
  TargetDate: '',
  Icon: '🎯',
  Description: '',
};

export default function SavingsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [goals, setGoals] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'deposit' | 'withdraw' | 'general'
  const [activeGoal, setActiveGoal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [amount, setAmount] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await savingsService.getAll();
      setGoals(res.goals);
      setTransactions(res.transactions || []);
      setTotalSavings(res.totalSavings ?? 0);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalMode('create');
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({
      GoalName: goal.GoalName,
      TargetAmount: goal.TargetAmount,
      TargetDate: goal.TargetDate || '',
      Icon: goal.Icon || '🎯',
      Description: goal.Description || '',
    });
    setModalMode('edit');
  };

  const openTransaction = (goal, type) => {
    setActiveGoal(goal);
    setAmount('');
    setModalMode(type);
  };

  const submitGoal = async (e) => {
    e.preventDefault();
    const target = parseFloat(form.TargetAmount);
    if (!form.GoalName.trim()) { toast.error('Enter a goal name'); return; }
    if (isNaN(target) || target <= 0) { toast.error('Enter a valid target amount'); return; }
    setSyncStatus('saving');
    try {
      if (editing) {
        await savingsService.updateGoal(editing.ID, { ...form, TargetAmount: target, GoalName: form.GoalName.trim() });
        toast.success('Goal updated');
      } else {
        await savingsService.createGoal({ ...form, TargetAmount: target, GoalName: form.GoalName.trim() });
        toast.success('Goal created');
      }
      setSyncStatus('saved');
      setTimeout(() => { setModalMode(null); load(); }, 500);
    } catch (err) {
      setSyncStatus('error');
      toast.error(`Could not sync: ${err.message}`);
    }
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return; }
    const type = modalMode === 'deposit' ? 'Deposit' : 'Withdrawal';
    setSyncStatus('saving');
    try {
      await savingsService.addTransaction({
        GoalID: activeGoal.ID,
        Date: new Date().toISOString().slice(0, 10),
        Type: type,
        Amount: amt,
        Notes: '',
      });
      toast.success(type === 'Deposit' ? 'Money added to goal' : 'Money withdrawn');
      setSyncStatus('saved');
      setTimeout(() => { setModalMode(null); load(); }, 500);
    } catch (err) {
      setSyncStatus('error');
      toast.error(`Could not sync: ${err.message}`);
    }
  };

  const toggleComplete = async (id, complete) => {
    try {
      await savingsService.updateGoal(id, { Status: complete ? 'Completed' : 'Active' });
      toast.success(complete ? 'Goal completed!' : 'Goal reactivated');
      load();
    } catch (e) {
      toast.error(`Could not update: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await savingsService.deleteGoal(deleting);
      toast.success('Goal deleted');
      setGoals((prev) => prev.filter((g) => g.ID !== deleting));
      setDeleting(null);
    } catch (e) {
      toast.error(`Could not delete: ${e.message}`);
    }
  };

  const totalSavedInGoals = (goals || []).reduce((s, g) => s + (parseFloat(g.SavedAmount) || 0), 0);
  const totalTarget = (goals || []).reduce((s, g) => s + (parseFloat(g.TargetAmount) || 0), 0);

  const sortedTx = [...transactions].sort((a, b) => (b.CreatedAt || '').localeCompare(a.CreatedAt || '') || (b.Date || '').localeCompare(a.Date || ''));

  if (error) return <ErrorState title="Could not load savings" message={error} onRetry={load} />;

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple/40";
  const labelCls = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Savings"
        subtitle="Grow your savings and track goals."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModalMode('general_deposit')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-success hover:bg-success/10 transition">
              <PiggyBank size={16} /> Add Savings
            </button>
            <button onClick={() => setModalMode('general_withdraw')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-danger hover:bg-danger/10 transition">
              <ArrowUpCircle size={16} /> Withdraw Savings
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
              <Plus size={16} /> New Goal
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Savings" value={totalSavings} icon={PiggyBank} color="success" />
        <StatCard label="Saved in Goals" value={totalSavedInGoals} icon={Target} color="pink" delay={100} />
        <StatCard label="Total Goals" value={totalTarget} icon={Target} color="violet" delay={200} />
      </div>

      {/* Savings history */}
      <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
        <h3 className="font-semibold text-navy dark:text-white mb-4">Savings Transactions</h3>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : sortedTx.length === 0 ? (
          <EmptyState
            title="No savings transactions yet"
            message="Add savings to start building your balance."
            icon={PiggyBank}
            action={
              <button onClick={() => setModalMode('general_deposit')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
                <Plus size={16} /> Add Savings
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {sortedTx.map((t) => {
              const isDep = t.Type === 'Deposit';
              return (
                <div key={t.ID} className="flex items-center gap-3 py-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDep ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {isDep ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-navy dark:text-white truncate">
                      {isDep ? 'Deposit' : 'Withdrawal'}
                      <span className="text-xs text-gray-400 font-normal"> · {t.Date}{t.GoalID ? ' · Goal' : ''}</span>
                    </p>
                    {(t.Notes || t.GoalID) && (
                      <p className="text-xs text-gray-400 truncate">{t.GoalID ? (data?.goals?.find(g => g.ID === t.GoalID)?.GoalName || 'Savings goal') : ''}{(t.Notes ? (t.GoalID ? ' — ' : '') + t.Notes : '')}</p>
                    )}
                  </div>
                  <span className={`font-semibold text-sm ${isDep ? 'text-success' : 'text-danger'}`}>{isDep ? '+' : '−'}{formatINR(t.Amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goals */}
      <div>
        <h3 className="font-semibold text-navy dark:text-white mb-3">Savings Goals</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <ListSkeleton key={i} rows={3} />)}
          </div>
        ) : !goals || goals.length === 0 ? (
          <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
            <EmptyState
              title="No savings goals yet"
              message="Create a goal and start saving toward something you want."
              icon={Target}
              action={
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25">
                  <Plus size={16} /> New Goal
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <SavingsGoalCard
                key={g.ID}
                goal={g}
                onAddMoney={() => openTransaction(g, 'deposit')}
                onWithdraw={() => openTransaction(g, 'withdraw')}
                onEdit={openEdit}
                onDelete={() => setDeleting(g.ID)}
                onToggleComplete={toggleComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* General savings modal */}
      {(modalMode === 'general_deposit' || modalMode === 'general_withdraw') && (
        <SavingsTransactionForm
          open
          onClose={() => setModalMode(null)}
          onSaved={() => { setModalMode(null); setSyncStatus('saved'); load(); }}
          onError={(msg) => toast.error(msg)}
          currentSavings={totalSavings}
        />
      )}

      {/* Create/Edit modal */}
      <Modal
        open={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'edit' ? 'Edit Goal' : 'Create Savings Goal'}
        footer={
          <div className="flex items-center gap-3">
            <SyncStatus status={syncStatus} />
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" form="goal-form" disabled={syncStatus === 'saving'} className="px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-white disabled:opacity-60">
                {syncStatus === 'saving' ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
          </div>
        }
      >
        <form id="goal-form" onSubmit={submitGoal} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="goal-name">Goal Name</label>
            <input id="goal-name" className={inputCls} placeholder="e.g. New Headphones" value={form.GoalName} onChange={(e) => setForm({ ...form, GoalName: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} htmlFor="goal-target">Target Amount (₹)</label>
            <input id="goal-target" type="number" min="0" className={inputCls} placeholder="e.g. 3000" value={form.TargetAmount} onChange={(e) => setForm({ ...form, TargetAmount: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} htmlFor="goal-date">Target Date</label>
            <input id="goal-date" type="date" className={inputCls} value={form.TargetDate} onChange={(e) => setForm({ ...form, TargetDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, Icon: ic })} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition border ${form.Icon === ic ? 'border-purple bg-purple/10' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="goal-desc">Description (optional)</label>
            <textarea id="goal-desc" className={`${inputCls} min-h-[60px] resize-none`} placeholder="Why are you saving?" value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Transaction modal */}
      <Modal
        open={modalMode === 'deposit' || modalMode === 'withdraw'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'deposit' ? 'Add Money' : 'Withdraw Money'}
        footer={
          <div className="flex items-center gap-3">
            <SyncStatus status={syncStatus} />
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" form="tx-form" disabled={syncStatus === 'saving'} className="px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-white disabled:opacity-60">
                {syncStatus === 'saving' ? 'Saving...' : modalMode === 'deposit' ? 'Add Money' : 'Withdraw'}
              </button>
            </div>
          </div>
        }
      >
        <form id="tx-form" onSubmit={submitTransaction} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {modalMode === 'deposit' ? `Add money to "${activeGoal?.GoalName}".` : `Withdraw money from "${activeGoal?.GoalName}".`}
          </p>
          <div>
            <label className={labelCls} htmlFor="tx-amount">Amount (₹)</label>
            <input id="tx-amount" type="number" min="0" autoFocus className={inputCls} placeholder="e.g. 500" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {modalMode === 'deposit' && activeGoal && (
            <p className="text-xs text-gray-400">
              Note: Moving money to savings reduces your available spending balance.
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Goal?"
        message="This will permanently remove this savings goal. Its savings transactions will remain in your total savings history."
      />
    </div>
  );
}