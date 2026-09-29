import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, ArrowDownCircle, PiggyBank, Receipt, TrendingUp, Target,
  CalendarClock, Sparkles, Plus, PieChart, Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/app/StatCard.jsx';
import ExpenseForm from '../components/app/ExpenseForm.jsx';
import IncomeForm from '../components/app/IncomeForm.jsx';
import SavingsTransactionForm from '../components/app/SavingsTransactionForm.jsx';
import ResetModal from '../components/app/ResetModal.jsx';
import ProgressBar from '../components/reactbits/ProgressBar.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { StatCardSkeleton, ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { useToast } from '../components/app/Toast.jsx';
import api from '../services/api.js';
import { formatINR } from '../utils/format.js';

export default function DashboardPage({ onInitialize, initState, storageStatus }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [savingsFormOpen, setSavingsFormOpen] = useState(false);
  const [showPocketMoneySetup, setShowPocketMoneySetup] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleReset = async (sheets) => {
    if (resetting) return;
    setResetting(true);
    try {
      await api.post('/reset', { sheets });
      setResetOpen(false);
      toast.success('Data reset successfully');
      await load();
    } catch (e) {
      toast.error(`Could not reset data: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  if (error) {
    return <ErrorState title="Could not load dashboard" message={error} onRetry={load} />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <ListSkeleton rows={5} />
      </div>
    );
  }

  const s = data?.summary || { pocketMoney: 0, additionalIncome: 0, totalAvailable: 0, totalSpent: 0, remaining: 0, savings: 0 };
  const noPocketMoney = !s.pocketMoney && (s.totalSpent === 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-navy dark:text-white">Your Money Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's how your pocket money looks this month.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-danger hover:bg-danger/10 transition"
          >
            <Trash2 size={16} />
            Reset Data
          </button>
          <button
            onClick={() => setShowPocketMoneySetup(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25 hover:opacity-95 transition"
          >
            <Wallet size={16} />
            Set Pocket Money
          </button>
        </div>
      </div>

      {noPocketMoney && (
        <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
          <EmptyState
            title="Let's set up your month"
            message="Add your monthly pocket money to start tracking your spending."
            icon={Wallet}
            action={
              <button
                onClick={() => setShowPocketMoneySetup(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25"
              >
                <Plus size={16} />
                Set Pocket Money
              </button>
            }
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Pocket Money" value={s.pocketMoney} icon={Wallet} color="violet" />
        <StatCard label="Additional Income" value={s.additionalIncome} icon={ArrowDownCircle} color="success" delay={100} />
        <StatCard label="Total Available" value={s.totalAvailable} icon={TrendingUp} color="purple" delay={150} />
        <StatCard label="Total Spent" value={s.totalSpent} icon={Receipt} color="danger" delay={200} />
        <StatCard label="Remaining" value={s.remaining} icon={PieChart} color="success" delay={250} />
        <StatCard label="Savings" value={s.savings} icon={PiggyBank} color="pink" delay={300} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setExpenseFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-md shadow-purple/20"
        >
          <Plus size={16} /> Add Expense
        </button>
        <button
          onClick={() => navigate('/app/income')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
        >
          <ArrowDownCircle size={16} /> Add Income
        </button>
        <button
          onClick={() => setSavingsFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
        >
          <PiggyBank size={16} /> Add Savings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MonthlyProgress data={s} />
          <RecentTransactions data={data} />
        </div>
        <div className="space-y-6">
          <BudgetStatus budgets={data.budgetStatus} />
          <SavingsGoalGoal goals={data.savingsGoals} />
          <UpcomingRecurring items={data.upcomingRecurring} />
          <SmartInsightCard insight={data.smartInsight} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniStat label="Today's Spending" value={data.todaySpending} icon={Receipt} />
        <MiniStat label="This Week's Spending" value={data.weekSpending} icon={CalendarClock} />
        <MiniStat label="Top Category" value={data.topCategories[0]?.name || '—'} icon={TrendingUp} isCategory />
      </div>

      {expenseFormOpen && (
        <ExpenseForm
          open
          onClose={() => setExpenseFormOpen(false)}
          categories={data.categories}
          onSaved={load}
        />
      )}
      {showPocketMoneySetup && (
        <IncomeForm
          open
          mode="pocketMoney"
          onClose={() => setShowPocketMoneySetup(false)}
          onSaved={load}
          defaultPocketMoney={s.pocketMoney}
        />
      )}
      {resetOpen && (
        <ResetModal
          onClose={() => setResetOpen(false)}
          onConfirm={handleReset}
          resetting={resetting}
        />
      )}
      {savingsFormOpen && (
        <SavingsTransactionForm
          open
          onClose={() => setSavingsFormOpen(false)}
          onSaved={() => { setSavingsFormOpen(false); load(); }}
          onError={(msg) => toast.error(msg)}
          currentSavings={s.savings}
        />
      )}
    </div>
  );
}

function MonthlyProgress({ data }) {
  const total = data.totalAvailable || 0;
  const spent = data.totalSpent || 0;
  const pct = total > 0 ? (spent / total) * 100 : 0;
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy dark:text-white">Monthly Spending Progress</h3>
        <span className="text-xs text-gray-400">{Math.round(pct)}% used</span>
      </div>
      <ProgressBar progress={Math.min(pct, 100)} color="#6C4BFF" height={10} />
      <div className="flex justify-between mt-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Spent <strong className="text-navy dark:text-white">{formatINR(spent)}</strong></span>
        <span className="text-gray-500 dark:text-gray-400">of <strong className="text-navy dark:text-white">{formatINR(total)}</strong></span>
      </div>
    </div>
  );
}

function RecentTransactions({ data }) {
  const items = data.recentExpenses || [];
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
        <EmptyState
          title="No transactions yet"
          message="Add your first expense to start tracking."
          icon={Receipt}
        />
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <h3 className="font-semibold text-navy dark:text-white mb-4">Recent Transactions</h3>
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {items.map((e) => (
          <div key={e.ID} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
              <Receipt size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-navy dark:text-white truncate">{e.ExpenseName}</p>
              <p className="text-xs text-gray-400">{e.Category} · {e.Date}</p>
            </div>
            <span className="font-semibold text-sm text-danger">−{formatINR(e.Amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetStatus({ budgets }) {
  if (!budgets || budgets.length === 0) return null;
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <h3 className="font-semibold text-navy dark:text-white mb-4">Budget Status</h3>
      <div className="space-y-4">
        {budgets.slice(0, 4).map((b) => (
          <div key={b.ID}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">{b.Category}</span>
              <span className="text-gray-400">{formatINR(b.spent)} / {formatINR(b.BudgetLimit)}</span>
            </div>
            <ProgressBar progress={Math.min(b.percentage, 100)} color={b.percentage >= 90 ? '#EF4444' : b.percentage >= 75 ? '#F59E0B' : '#6C4BFF'} height={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SavingsGoalGoal({ goals }) {
  if (!goals || goals.length === 0) return null;
  const g = goals[0];
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy dark:text-white">Savings Goal</h3>
        <Target className="text-pink" size={18} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{g.Icon || '🎯'}</span>
        <div className="flex-1">
          <p className="font-medium text-navy dark:text-white text-sm">{g.GoalName}</p>
          <p className="text-xs text-gray-400">{formatINR(g.saved)} / {formatINR(g.TargetAmount)}</p>
          <ProgressBar progress={Math.min(g.percentage, 100)} color="#D900C8" height={8} />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{Math.round(g.percentage)}% complete</p>
    </div>
  );
}

function UpcomingRecurring({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy dark:text-white">Upcoming Recurring</h3>
        <CalendarClock className="text-warning" size={18} />
      </div>
      <div className="space-y-3">
        {items.slice(0, 3).map((r) => (
          <div key={r.ID} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{r.ExpenseName}</span>
            <span className="text-gray-400">{r.NextPaymentDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmartInsightCard({ insight }) {
  if (!insight) return null;
  return (
    <div className="bg-gradient-to-br from-violet via-purple to-pink rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} />
        <h3 className="font-semibold">Smart Insight</h3>
      </div>
      <p className="text-sm text-white/90">{insight}</p>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, isCategory }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 border border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <Icon size={15} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-semibold text-navy dark:text-white">
        {isCategory ? value : formatINR(value)}
      </p>
    </div>
  );
}
