import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, ArrowLeftRight } from 'lucide-react';
import { transactionService } from '../services/transactionService.js';
import TransactionTable from '../components/app/TransactionTable.jsx';
import TransactionCard from '../components/app/TransactionCard.jsx';
import { EmptyState } from '../components/app/EmptyState.jsx';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import { formatINR } from '../utils/format.js';

const FILTER_INPUT = "px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-navy text-sm text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-purple/40";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('Newest');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    if (!transactions) return [];
    return [...new Set(transactions.map(t => t.Category).filter(Boolean))];
  }, [transactions]);

  const methods = useMemo(() => {
    if (!transactions) return [];
    return [...new Set(transactions.map(t => t.PaymentMethod).filter(Boolean))];
  }, [transactions]);

  const filtered = useMemo(() => {
    if (!transactions) return [];
    let list = [...transactions];

    if (typeFilter !== 'All') list = list.filter(t => t.Type === typeFilter);
    if (categoryFilter !== 'All') list = list.filter(t => t.Category === categoryFilter);
    if (methodFilter !== 'All') list = list.filter(t => t.PaymentMethod === methodFilter);
    if (dateFrom) list = list.filter(t => (t.Date || '') >= dateFrom);
    if (dateTo) list = list.filter(t => (t.Date || '') <= dateTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => (t.Name || '').toLowerCase().includes(q) || (t.Category || '').toLowerCase().includes(q));
    }

    switch (sort) {
      case 'Newest': list.sort((a, b) => new Date(b.Date || b.CreatedAt) - new Date(a.Date || a.CreatedAt)); break;
      case 'Oldest': list.sort((a, b) => new Date(a.Date || a.CreatedAt) - new Date(b.Date || b.CreatedAt)); break;
      case 'Highest': list.sort((a, b) => Math.abs(b.Amount) - Math.abs(a.Amount)); break;
      case 'Lowest': list.sort((a, b) => Math.abs(a.Amount) - Math.abs(b.Amount)); break;
      default: break;
    }
    return list;
  }, [transactions, search, typeFilter, categoryFilter, methodFilter, dateFrom, dateTo, sort]);

  const clearFilters = () => {
    setSearch(''); setTypeFilter('All'); setCategoryFilter('All');
    setMethodFilter('All'); setDateFrom(''); setDateTo(''); setSort('Newest');
  };

  if (error) return <ErrorState title="Could not load transactions" message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Transactions" subtitle="Every income, expense and savings record." />

      <div className="bg-white dark:bg-navy-light rounded-2xl p-4 border border-gray-100 dark:border-white/5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className={`${FILTER_INPUT} w-full pl-9`}
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={FILTER_INPUT} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option>
            <option>Income</option>
            <option>Expense</option>
            <option>Savings</option>
          </select>
          <select className={FILTER_INPUT} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col lg:flex-row gap-3 mt-3">
          <select className={FILTER_INPUT} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option>All Methods</option>
            {methods.map(m => <option key={m}>{m}</option>)}
          </select>
          <input type="date" className={FILTER_INPUT} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className={FILTER_INPUT} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <select className={FILTER_INPUT} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Highest Amount</option>
            <option>Lowest Amount</option>
          </select>
          {(search || typeFilter !== 'All' || categoryFilter !== 'All' || methodFilter !== 'All' || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : !filtered || filtered.length === 0 ? (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5">
          <EmptyState
            title="No matching transactions"
            message={transactions?.length ? 'Try adjusting your filters.' : 'Add your first transaction to see it here.'}
            icon={ArrowLeftRight}
            action={transactions?.length ? (
              <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white">
                Clear Filters
              </button>
            ) : null}
          />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <TransactionTable transactions={filtered} />
          </div>
          <div className="lg:hidden space-y-3">
            {filtered.map((t) => <TransactionCard key={t.ID} transaction={t} />)}
          </div>
        </>
      )}
    </div>
  );
}
