import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import SplitText from '../reactbits/SplitText.jsx';
import TiltedCard from '../reactbits/TiltedCard.jsx';

const incomeExpense = [
  { name: 'Income', amount: 5500 },
  { name: 'Expense', amount: 3250 },
];

const categories = [
  { name: 'Food', value: 1100 },
  { name: 'Travel', value: 500 },
  { name: 'Entertainment', value: 900 },
  { name: 'Shopping', value: 450 },
  { name: 'Others', value: 300 },
];

const daily = [
  { d: 1, v: 180 }, { d: 2, v: 120 }, { d: 3, v: 260 }, { d: 4, v: 90 },
  { d: 5, v: 300 }, { d: 6, v: 150 }, { d: 7, v: 220 }, { d: 8, v: 180 },
  { d: 9, v: 140 }, { d: 10, v: 350 }, { d: 11, v: 120 }, { d: 12, v: 240 },
  { d: 13, v: 160 }, { d: 14, v: 280 }, { d: 15, v: 130 },
];

const COLORS = ['#6C4BFF', '#8B35FF', '#D900C8', '#FF2D7A', '#10B981'];

export default function AnalyticsShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-navy-light">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Analytics</p>
          <SplitText
            as="h2"
            text="Understand your spending. Not spreadsheets."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl leading-relaxed">
            Income vs expense, category mix, daily trends and month-over-month change — all visualized clearly.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
            <Metric label="Savings Rate" value="9%" />
            <Metric label="Avg Daily Spend" value="₹217" />
            <Metric label="Top Category" value="Food" />
            <Metric label="Largest Expense" value="₹450" />
          </div>
        </div>

        <TiltedCard tiltMaxAngleX={2.5} tiltMaxAngleY={2.5} className="w-full max-w-lg mx-auto">
          <div className="rounded-2xl bg-navy-light border border-white/10 p-5 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Chart miniStyle="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-2">Income vs Expense</p>
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={incomeExpense}>
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      <Cell fill="#10B981" /><Cell fill="#FF2D7A" />
                    </Bar>
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </Chart>
              <Chart miniStyle="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-2">Categories</p>
                <ResponsiveContainer width="100%" height={90}>
                  <PieChart>
                    <Pie data={categories} dataKey="value" innerRadius={20} outerRadius={36}>
                      {categories.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Chart>
              <Chart miniStyle="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-2">Daily Trend</p>
                <ResponsiveContainer width="100%" height={90}>
                  <AreaChart data={daily}>
                    <defs>
                      <linearGradient id="showcaseDaily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B35FF" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#8B35FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#8B35FF" fill="url(#showcaseDaily)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Chart>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-[10px] text-gray-400 mb-3">Monthly Spend Trend</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={[{ m: 'Jan', v: 2800 }, { m: 'Feb', v: 3200 }, { m: 'Mar', v: 2950 }, { m: 'Apr', v: 3500 }, { m: 'May', v: 3250 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="m" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                    {[{ m: 'Apr', v: 3500 }].map((x, i) => {
                      const idx = ['Jan','Feb','Mar','Apr','May'].map(d => d === x.m).indexOf(true);
                      return <Cell key={idx} fill={i === 0 && idx >= 0 ? '#D900C8' : '#6C4BFF'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TiltedCard>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold text-navy dark:text-white mt-1 text-lg">{value}</p>
    </div>
  );
}

function Chart({ children, miniStyle }) {
  return <div className={miniStyle}>{children}</div>;
}