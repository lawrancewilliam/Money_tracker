import { readSheet } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { ok, mapError, internalError } from './lib/responses.js';
import {
  calculateTotalIncome, calculateTotalExpenses, calculateCategorySpending,
  calculateSavingsNet, calculateDailySpending,
} from './lib/financialCalculations.js';

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method !== 'GET') return mapError(res, 405, 'Method not allowed');

    const expenses = await readSheet('Expenses');
    const income = await readSheet('Income');
    const pocketMoney = await readSheet('PocketMoney');
    const budgets = await readSheet('Budgets');
    const savingsTx = await readSheet('SavingsTransactions');
    const goals = await readSheet('SavingsGoals');

    const nowDate = new Date();
    const month = nowDate.getMonth() + 1;
    const year = nowDate.getFullYear();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const currentTotal = calculateTotalIncome(pocketMoney, income, month, year);
    const expensesCurrent = calculateTotalExpenses(expenses, month, year);
    const expensesPrev = month === 1 ? 0 : calculateTotalExpenses(expenses, prevMonth, prevYear);

    const incomeCurrent = currentTotal.totalIncome;
    const incomePrev = calculateTotalIncome(pocketMoney, income, prevMonth, prevYear).totalIncome;

    const categoryCur = calculateCategorySpending(expenses, month, year);
    const dailyCur = calculateDailySpending(expenses, month, year);

    const savingsNet = calculateSavingsNet(savingsTx);
    const goalTotals = goals.map(g => ({
      name: g.GoalName,
      target: parseFloat(g.TargetAmount) || 0,
      saved: calculateSavingsNet(savingsTx, g.ID),
    }));

    const daysInMonth = new Date(year, month, 0).getDate();
    const dayOfMonth = nowDate.getDate() || 1;

    let topCategory = null;
    let maxSpend = 0;
    Object.entries(categoryCur).forEach(([cat, amt]) => {
      if (amt > maxSpend) { maxSpend = amt; topCategory = cat; }
    });

    let largestExpense = null;
    expenses.forEach(e => {
      if (e.Date && new Date(e.Date).getMonth() + 1 === month) {
        const a = parseFloat(e.Amount) || 0;
        if (!largestExpense || a > (parseFloat(largestExpense.Amount) || 0)) largestExpense = e;
      }
    });

    const savingsRate = incomeCurrent > 0 ? (savingsNet / incomeCurrent) * 100 : 0;
    const dailyAverage = dayOfMonth > 0 ? expensesCurrent / dayOfMonth : 0;
    const projectedMonthEnd = dailyAverage * daysInMonth;
    const projectedBalance = incomeCurrent - projectedMonthEnd - savingsNet;

    const moMChange = expensesPrev > 0 ? ((expensesCurrent - expensesPrev) / expensesPrev) * 100 : 0;

    ok(res, {
      currentMonth: { month, year },
      summary: {
        income: incomeCurrent,
        expenses: expensesCurrent,
        pocketMoney: currentTotal.pocketMoney,
        additionalIncome: currentTotal.additionalIncome,
        savings: savingsNet,
        remaining: incomeCurrent - expensesCurrent - Math.max(savingsNet, 0),
      },
      categorySpending: Object.entries(categoryCur).map(([name, value]) => ({ name, value })),
      dailySpending: Object.entries(dailyCur).map(([day, value]) => ({ day: parseInt(day), value })),
      monthlyTrend: [
        { month: prevMonth, income: incomePrev, expenses: expensesPrev },
        { month, income: incomeCurrent, expenses: expensesCurrent },
      ],
      savingsGoals: goalTotals,
      savingsRate,
      dailyAverage,
      topCategory,
      largestExpense,
      projectedMonthEnd,
      projectedBalance,
      monthOverMonthChange: moMChange,
    });
  } catch (e) {
    return internalError(res, e);
  }
}
