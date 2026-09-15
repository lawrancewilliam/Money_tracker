import SplitText from '../reactbits/SplitText.jsx';
import AnimatedContent from '../reactbits/AnimatedContent.jsx';
import CountUp from '../reactbits/CountUp.jsx';
import GlareHover from '../reactbits/GlareHover.jsx';

const budgets = [
  { name: 'Food', spent: 1100, limit: 1500, pct: 73, status: 'Safe', color: '#10B981' },
  { name: 'Travel', spent: 500, limit: 800, pct: 62, status: 'Safe', color: '#6C4BFF' },
  { name: 'Entertainment', spent: 900, limit: 1000, pct: 90, status: 'Almost Exhausted', color: '#FF2D7A' },
];

export default function BudgetShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-light-bg dark:bg-navy">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-violet uppercase mb-3">Budget Alerts</p>
          <SplitText
            as="h2"
            text="Know when to slow down."
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight"
            delay={30}
          />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl leading-relaxed">
            Set monthly limits per category and get clear warnings before you overspend.
            Safe today. Alerts when you approach the edge.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {['Safe', 'Approaching Limit', 'Almost Exhausted', 'Exceeded'].map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {budgets.map((b, i) => (
            <AnimatedContent key={b.name} delay={i * 150} distance={40}>
              <GlareHover className="rounded-2xl bg-white dark:bg-navy-light border border-gray-100 dark:border-white/5 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-navy dark:text-white">{b.name}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    b.status === 'Exceeded' ? 'bg-danger/10 text-danger'
                    : b.status === 'Almost Exhausted' ? 'bg-warning/10 text-warning'
                    : 'bg-success/10 text-success'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    <CountUp end={b.spent} prefix="₹" /> / <CountUp end={b.limit} prefix="₹" />
                  </span>
                  <span className="font-semibold text-navy dark:text-white"><CountUp end={b.pct} suffix="%" duration={1500} /></span>
                </div>
              </GlareHover>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}