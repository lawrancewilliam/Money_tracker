import { readSheet } from './lib/dbService.js';
import { getSupabase } from './lib/supabaseClient.js';
import { ok, mapError, internalError } from './lib/responses.js';
import {
  calculateTotalIncome, calculateTotalExpenses, calculateCategorySpending,
  calculateSavingsNet, calculateDailySpending, calculateBudgetStatus,
} from './lib/financialCalculations.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  try {
    getSupabase();

    if (req.method !== 'POST') return mapError(res, 405, 'Method not allowed');

    const expenses = await readSheet('Expenses');
    const incomeData = await readSheet('Income');
    const pocketMoney = await readSheet('PocketMoney');
    const budgets = await readSheet('Budgets');
    const savingsTx = await readSheet('SavingsTransactions');
    const goals = await readSheet('SavingsGoals');

    const nowDate = new Date();
    const month = nowDate.getMonth() + 1;
    const year = nowDate.getFullYear();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const incomeCur = calculateTotalIncome(pocketMoney, incomeData, month, year);
    const incomePrev = calculateTotalIncome(pocketMoney, incomeData, prevMonth, prevYear);
    const spentCur = calculateTotalExpenses(expenses, month, year);
    const spentPrev = calculateTotalExpenses(expenses, prevMonth, prevYear);

    const categoryCur = calculateCategorySpending(expenses, month, year);
    const categoryPrev = calculateCategorySpending(expenses, prevMonth, prevYear);

    const daysInMonth = new Date(year, month, 0).getDate();
    const dayOfMonth = nowDate.getDate() || 1;
    const dailyAvg = dayOfMonth > 0 ? spentCur / dayOfMonth : 0;
    const projectedEnd = dailyAvg * daysInMonth;
    const projectedBalance = incomeCur.totalIncome - projectedEnd - Math.max(calculateSavingsNet(savingsTx), 0);

    const categoryChanges = {};
    Object.keys({ ...categoryCur, ...categoryPrev }).forEach(cat => {
      const cur = categoryCur[cat] || 0;
      const prev = categoryPrev[cat] || 0;
      if (prev > 0) categoryChanges[cat] = ((cur - prev) / prev) * 100;
      else if (cur > 0) categoryChanges[cat] = 100;
    });

    const budgetStatus = budgets
      .filter(b => parseInt(b.Month) === month && parseInt(b.Year) === year)
      .map(b => {
        const spent = categoryCur[b.Category] || 0;
        return {
          category: b.Category,
          spent,
          limit: parseFloat(b.BudgetLimit) || 0,
          status: calculateBudgetStatus(spent, parseFloat(b.BudgetLimit) || 0),
          pct: (parseFloat(b.BudgetLimit) || 0) > 0 ? (spent / (parseFloat(b.BudgetLimit) || 0)) * 100 : 0,
        };
      });

    const savingsNet = calculateSavingsNet(savingsTx);
    const goalProgress = goals.map(g => {
      const saved = calculateSavingsNet(savingsTx, g.ID);
      return { name: g.GoalName, saved, target: parseFloat(g.TargetAmount) || 0 };
    });

    const prompt = buildPrompt({
      spentCur, spentPrev, incomeCur, incomePrev, categoryCur, categoryChanges,
      budgetStatus, projectedEnd, projectedBalance, savingsNet, goalProgress,
      month, year, dayOfMonth,
    });

    let insightResult = null;
    let usedFallback = false;

    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
            }),
          }
        );
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            insightResult = JSON.parse(cleaned);
          } catch (e) {
            insightResult = { summary: text };
          }
        }
      } catch (e) {
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    if (!insightResult) {
      usedFallback = true;
      insightResult = generateFallbackInsights({
        spentCur, spentPrev, incomeCur, categoryChanges, budgetStatus,
        projectedEnd, projectedBalance, savingsNet, goalProgress, categoryCur, dayOfMonth,
      });
    }

    return ok(res, {
      insights: {
        ...insightResult,
        usedFallback,
        computed: {
          spentCur, spentPrev, incomeTotal: incomeCur.totalIncome,
          projectedEnd, projectedBalance, savingsNet, dailyAvg,
          topCategory: Object.entries(categoryCur).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
          largestCategoryValue: Math.max(...Object.values(categoryCur), 0),
        },
      },
    });
  } catch (e) {
    return internalError(res, e);
  }
}

function buildPrompt({ spentCur, spentPrev, incomeCur, categoryCur, categoryChanges, budgetStatus, projectedEnd, projectedBalance, savingsNet, goalProgress, month, year, dayOfMonth }) {
  return `You are a friendly, simple personal finance assistant for a student pocket money tracker. Given the following data about month ${month}/${year}, write encouraging, practical, non-technical insights. IMPORTANT: Do not claim to be a professional financial adviser. Be concise and warm.

Return a JSON object with exactly these keys:
- spendingSummary: 1-2 sentences on overall spending
- categoryAnalysis: 1-2 sentences on top categories and changes vs last month
- budgetRecommendation: 1-2 sentences with practical advice on budgets
- monthEndPrediction: 1 sentence predicting month-end balance
- savingsSuggestion: 1-2 sentences on saving
- spendingPattern: 1 sentence on timing/pattern
- overallTip: 1 short encouraging sentence

Data:
Total spent so far: ₹${Math.round(spentCur)} (last month ₹${Math.round(spentPrev)})
Total income: ₹${Math.round(incomeCur.totalIncome)}
Day of month: ${dayOfMonth}
Category changes vs last month: ${JSON.stringify(categoryChanges)}
Budget status: ${JSON.stringify(budgetStatus)}
Projected month-end spend: ₹${Math.round(projectedEnd)}
Projected balance: ₹${Math.round(projectedBalance)}
Net savings to date: ₹${Math.round(savingsNet)}
Goals: ${JSON.stringify(goalProgress)}`;
}

function generateFallbackInsights({ spentCur, spentPrev, incomeCur, categoryChanges, budgetStatus, projectedEnd, projectedBalance, savingsNet, goalProgress, categoryCur, dayOfMonth }) {
  const spendingSummary = `You've spent ₹${Math.round(spentCur)} so far this month${spentPrev > 0 ? `, compared to ₹${Math.round(spentPrev)} last month` : ''}.`;

  const sortedCats = Object.entries(categoryCur).sort((a, b) => b[1] - a[1]);
  let categoryAnalysis = 'You don\u2019t have category data yet this month.';
  if (sortedCats.length > 0) {
    const top = sortedCats[0];
    const change = categoryChanges[top[0]];
    categoryAnalysis = `${top[0]} is your biggest category at ₹${Math.round(top[1])}${typeof change === 'number' && !isNaN(change) ? ` (${Math.round(change)}% vs last month).` : '.'}`;
  }

  const critical = budgetStatus.find(b => b.status === 'Exceeded') || budgetStatus.find(b => b.status === 'Almost Exhausted');
  const budgetRecommendation = critical
    ? `Your ${critical.category} budget ${critical.status === 'Exceeded' ? 'has been exceeded' : 'is almost exhausted'} (${Math.round(critical.pct)}%). Consider pausing this category for the rest of the month.`
    : 'Your budgets are on track. Keep an eye on any category nearing its limit.';

  const monthEndPrediction = incomeCur.totalIncome > 0
    ? `At your current pace, your estimated month-end balance is ${projectedBalance >= 0 ? `₹${Math.round(projectedBalance)}` : `₹${Math.round(-projectedBalance)} in the negative`}.`
    : 'Set up your pocket money to see a month-end prediction.';

  let savingsSuggestion;
  if (savingsNet > 0) {
    savingsSuggestion = `You\u2019ve saved ₹${Math.round(savingsNet)} so far. Keep it up!`;
  } else {
    savingsSuggestion = 'Try setting aside a small amount, like ₹100 this week, to start building a savings habit.';
  }

  if (goalProgress.length > 0) {
    const close = goalProgress.sort((a, b) => (a.saved / (a.target || 1)) - (b.saved / (b.target || 1)))[0];
    if (close && close.target > 0 && close.saved > 0) {
      const pct = Math.round((close.saved / close.target) * 100);
      savingsSuggestion += ` You\u2019re ${pct}% of the way to your \u201c${close.name}\u201d goal.`;
    }
  }

  const spendingPattern = `Your daily average so far is ₹${spentCur > 0 && dayOfMonth > 0 ? Math.round(spentCur / dayOfMonth) : 0}.`;

  const overallTip = 'Small consistent steps make a big difference. You\u2019re doing great!';

  return { spendingSummary, categoryAnalysis, budgetRecommendation, monthEndPrediction, savingsSuggestion, spendingPattern, overallTip };
}
