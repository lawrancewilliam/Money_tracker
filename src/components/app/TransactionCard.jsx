import { ArrowUpRight, ArrowDownLeft, PiggyBank } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const typeConfig = {
  Expense: { icon: ArrowUpRight, color: 'text-danger', bg: 'bg-danger/10', sign: '-' },
  Income: { icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success/10', sign: '+' },
  Savings: { icon: PiggyBank, color: 'text-violet', bg: 'bg-violet/10', sign: '' },
};

export default function TransactionCard({ transaction }) {
  const { Name, Type, Category, Amount, PaymentMethod, Date, Time } = transaction;
  const config = typeConfig[Type] || typeConfig.Expense;
  const Icon = config.icon;

  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-xl shrink-0', config.bg)}>
          <Icon size={18} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-navy dark:text-white text-sm truncate">{Name}</h4>
            <span className={cn('font-semibold text-sm shrink-0', config.color)}>
              {config.sign}₹{Number(Amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{Category}</span>
              {PaymentMethod && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
                  <span>{PaymentMethod}</span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {Date}{Time ? ` · ${Time}` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
