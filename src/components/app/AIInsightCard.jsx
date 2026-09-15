import { cn } from '../../utils/cn.js';

export default function AIInsightCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet/10 to-purple/10">
            <Icon size={18} className="text-violet" />
          </div>
        )}
        <h4 className="font-semibold text-navy dark:text-white">{title}</h4>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
