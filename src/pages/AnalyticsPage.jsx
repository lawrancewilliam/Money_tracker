import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import ErrorState from '../components/app/ErrorState.jsx';
import { ChartSkeleton } from '../components/app/LoadingSkeleton.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { formatINR } from '../utils/format.js';
import api from '../services/api.js';

const COLORS = ['#6C4BFF', '#8B35FF', '#D900C8', '#FF2D7A', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('This Month');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics');
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState title="Could not load analytics" message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        subtitle="Understand your spending, not spreadsheets."
        action={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-sm text-navy dark:text-white focus:outline-none"
          >
            <option>This Month</option>
            <option>This Week</option>
            <option>Last Month</option>
          </select>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightStat icon={Award} label="Top Category" value={data.topCategory || '—'} />
            <InsightStat icon={TrendingUp} label="Largest Expense" value={data.largestExpense ? formatINR(data.largestExpense.Amount) : '—'} />
            <InsightStat icon={Target} label="Daily Average" value={formatINR(data.dailyAverage)} />
            <InsightStat icon={TrendingDown} label="Savings Rate" value={`${Math.round(data.savingsRate)}%`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Income vs Expense">
              {data.summary.income === 0 && data.summary.expenses === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[{ name: 'Income', amount: data.summary.income }, { name: 'Expense', amount: data.summary.expenses }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip formatter={(v) => formatINR(v)} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      <Cell fill="#10B981" /><Cell fill="#EF4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Category Spending">
              {!data.categorySpending.length ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data.categorySpending} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                      {data.categorySpending.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatINR(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Daily Spending">
              {!data.dailySpending.length ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.dailySpending.map(d => ({ ...d, label: `Day ${d.day}` }))}>
                    <defs>
                      <linearGradient id="daily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C4BFF" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6C4BFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip formatter={(v) => formatINR(v)} />
                    <Area type="monotone" dataKey="value" stroke="#6C4BFF" fill="url(#daily)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Savings Goals Progress">
              {!data.savingsGoals.length ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.savingsGoals.map(g => ({ name: g.name, saved: g.saved, target: g.target }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip formatter={(v) => formatINR(v)} />
                    <Legend />
                    <Bar dataKey="saved" fill="#8B35FF" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="target" fill="#D900C8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Month-over-Month Change" value={`${data.monthOverMonthChange >= 0 ? '+' : ''}${Math.round(data.monthOverMonthChange)}%`} color={data.monthOverMonthChange > 0 ? 'text-danger' : 'text-success'} />
            <StatBox label="Projected Month-End Spend" value={formatINR(data.projectedMonthEnd)} />
            <StatBox label="Projected Balance" value={formatINR(data.projectedBalance)} color={data.projectedBalance < 0 ? 'text-danger' : 'text-success'} />
            <StatBox label="Category Share" value={`${data.topCategory || '—'} ${data.summary.expenses > 0 && data.topCategory ? Math.round((data.categorySpending.find(c => c.name === data.topCategory)?.value || 0) / data.summary.expenses * 100) + '%' : ''}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
      <h3 className="font-semibold text-navy dark:text-white mb-5">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
      No data for this period yet.
    </div>
  );
}

function InsightStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 border border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <Icon size={15} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-semibold text-navy dark:text-white truncate">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color = 'text-navy dark:text-white' }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 border border-gray-100 dark:border-white/5">
      <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
      <p className={`font-semibold text-lg ${color}`}>{value}</p>
    </div>
  );
}
