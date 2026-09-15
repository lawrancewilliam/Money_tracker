import CountUp from '../reactbits/CountUp.jsx';

export default function StatCard({ label, value, icon: Icon, prefix = '₹', color = 'purple', delay = 0, hint }) {
  const colorMap = {
    purple: 'text-purple bg-purple/10',
    success: 'text-success bg-success/10',
    pink: 'text-pink bg-pink/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    violet: 'text-violet bg-violet/10',
    navy: 'text-navy bg-gray-100',
  };

  const iconClass = colorMap[color] || colorMap.purple;

  return (
    <div className="relative flex items-start justify-between gap-4 bg-white dark:bg-navy-light rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0 self-stretch flex flex-col">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-[1.35rem] min-h-[2.7rem]">
          {label}
        </p>
        <div className="mt-0.5 text-2xl font-bold text-navy dark:text-white flex items-baseline gap-0.5">
          <span className="text-base font-semibold text-gray-400">{prefix}</span>
          <CountUp end={Number(value) || 0} duration={1200} delay={delay} />
        </div>
        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
      {Icon && (
        <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
