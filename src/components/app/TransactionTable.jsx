import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const badgeColors = {
  Expense: 'bg-danger/10 text-danger',
  Income: 'bg-success/10 text-success',
  Savings: 'bg-violet/10 text-violet',
};

export default function TransactionTable({ transactions = [], onDelete, onEdit }) {
  return (
    <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5">
              <th className="text-left px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Type</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Category</th>
              <th className="text-right px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Amount</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Payment Method</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Date</th>
              {(onDelete || onEdit) && (
                <th className="text-right px-5 py-3.5 font-medium text-gray-400 text-xs uppercase tracking-wide">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => {
              const sign = tx.Type === 'Income' ? '+' : tx.Type === 'Expense' ? '-' : '';
              const amountColor = tx.Type === 'Income' ? 'text-success' : tx.Type === 'Expense' ? 'text-danger' : 'text-violet';
              return (
                <tr key={tx.ID || i} className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-navy dark:text-white whitespace-nowrap">{tx.Name}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', badgeColors[tx.Type] || badgeColors.Expense)}>
                      {tx.Type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.Category}</td>
                  <td className={cn('px-5 py-3.5 text-right font-semibold whitespace-nowrap', amountColor)}>
                    {sign}₹{Number(tx.Amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.PaymentMethod}</td>
                  <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{tx.Date}{tx.Time ? ` ${tx.Time}` : ''}</td>
                  {(onDelete || onEdit) && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-violet hover:bg-violet/10 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(tx.ID)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <p className="text-center text-gray-400 py-10 text-sm">No transactions found</p>
      )}
    </div>
  );
}
