import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarX } from 'lucide-react';
import ErrorState from '../components/app/ErrorState.jsx';
import { ListSkeleton } from '../components/app/LoadingSkeleton.jsx';
import { formatINR } from '../utils/format.js';
import { Modal } from '../components/app/Modal.jsx';
import { expenseService } from '../services/expenseService.js';
import { EmptyState } from '../components/app/EmptyState.jsx';

export default function CalendarPage() {
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getAll();
      setExpenses(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const dailyMap = useMemo(() => {
    const map = {};
    (expenses || []).forEach((e) => {
      if (!e.Date) return;
      const d = new Date(e.Date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [expenses, year, month]);

  const daysWithSpend = Object.keys(dailyMap).map(Number);
  const averages = daysWithSpend.map(d => dailyMap[d].reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0));
  const avg = averages.length ? averages.reduce((s, a) => s + a, 0) / averages.length : 0;
  const highDays = new Set(daysWithSpend.filter(d => (dailyMap[d].reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0)) > avg * 1.5));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  if (error) return <ErrorState title="Could not load calendar" message={error} onRetry={load} />;

  const isToday = (d) => {
    const now = new Date();
    return d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold text-navy dark:text-white">Expense Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-navy dark:text-white min-w-[120px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : (
        <div className="bg-white dark:bg-navy-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-3 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-white/5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className="min-h-16 bg-white dark:bg-navy-light" />;
              const dayExpenses = dailyMap[day] || [];
              const total = dayExpenses.reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
              const isHigh = highDays.has(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelected({ day, expenses: dayExpenses, total })}
                  className={`min-h-16 flex flex-col items-center pt-2 bg-white dark:bg-navy-light hover:bg-purple/5 transition ${
                    isToday(day) ? 'ring-2 ring-inset ring-purple' : ''
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-purple' : 'text-navy dark:text-white'}`}>{day}</span>
                  {total > 0 && (
                    <>
                      <span className={`text-[10px] font-semibold mt-1 ${isHigh ? 'text-danger' : 'text-success'}`}>{formatINR(total)}</span>
                      {isHigh && <span className="text-[9px] text-danger mt-0.5">▲ high</span>}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={`${selected.day} ${monthName}`}
        >
          {selected.expenses.length === 0 ? (
            <p className="text-sm text-gray-400">No spending on this day.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total spending</span>
                <span className="font-semibold text-danger">{formatINR(selected.total)}</span>
              </div>
              {selected.expenses.map((e) => (
                <div key={e.ID} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-navy dark:text-white">{e.ExpenseName}</p>
                    <p className="text-xs text-gray-400">{e.Category}{e.Time ? ` · ${e.Time}` : ''}</p>
                  </div>
                  <span className="text-danger font-medium">−{formatINR(e.Amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
