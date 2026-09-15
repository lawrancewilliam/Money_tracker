import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Info, PiggyBank, TrendingUp, Wallet, CalendarDays, Target, BarChart3 } from 'lucide-react';
import ErrorState from '../components/app/ErrorState.jsx';
import PageHeader from '../components/app/PageHeader.jsx';
import AIInsightCard from '../components/app/AIInsightCard.jsx';
import { analyticsService } from '../services/analyticsService.js';

export default function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getAiInsights();
      setInsights(res.insights);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState title="Could not generate insights" message={error} onRetry={load} />;

  const sections = insights ? [
    { title: 'Spending Summary', icon: Wallet, key: 'spendingSummary' },
    { title: 'Category Analysis', icon: BarChart3, key: 'categoryAnalysis' },
    { title: 'Budget Recommendation', icon: Target, key: 'budgetRecommendation' },
    { title: 'Month-End Prediction', icon: CalendarDays, key: 'monthEndPrediction' },
    { title: 'Savings Suggestion', icon: PiggyBank, key: 'savingsSuggestion' },
    { title: 'Spending Pattern', icon: TrendingUp, key: 'spendingPattern' },
  ] : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Insights"
        subtitle="Your spending, explained simply."
        action={
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white shadow-lg shadow-purple/25 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating...' : 'Regenerate'}
          </button>
        }
      />

      {insights && insights.usedFallback && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-warning/10 text-warning text-sm">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>Connected insights are unavailable right now. Showing smart local insights generated from your data instead.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-navy-light rounded-2xl p-6 border border-gray-100 dark:border-white/5">
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded mb-2 w-full" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <AIInsightCard
              key={s.key}
              title={s.title}
              icon={s.icon}
            >
              <p>{insights[s.key] || 'No insight available.'}</p>
            </AIInsightCard>
          ))}
          {insights.overallTip && (
            <div className="md:col-span-2 bg-gradient-to-br from-violet via-purple to-pink rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} />
                <h3 className="font-semibold">A friendly tip</h3>
              </div>
              <p className="text-sm text-white/90">{insights.overallTip}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
