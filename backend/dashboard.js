import { readSheet } from './lib/dbService.js';
import { getSupabase } from './lib/supabaseClient.js';
import { ok, mapError, internalError } from './lib/responses.js';
import {
  calculateTotalIncome, calculateTotalExpenses, calculateCategorySpending,
  calculateSavingsNet, calculateDailySpending, calculateBudgetStatus,
} from './lib/financialCalculations.js';

export default async function handler(req, res) {
  try {
    getSupabase();

    if (req.method !== 'GET') return mapError(res, 405, 'Method not allowed');

    const expenses = await readSheet('Expenses');
    const incomeData = await readSheet('Income');
    const pocketMoney = await readSheet('PocketMoney');
    const budgets = await readSheet('Budgets');
    const savingsTx = await readSheet('SavingsTransactions');
    const goals = await readSheet('SavingsGoals');
    const recurring = await readSheet('RecurringExpenses');
    const notifications = await readSheet('Notifications');
    const settings = await readSheet('UserSettings');
    const categories = await readSheet('Categories');

    const nowDate = new Date();
    const month = nowDate.getMonth() + 1;
    const year = nowDate.getFullYear();

    const income = calculateTotalIncome(pocketMoney, incomeData, month, year);
    const totalSpent = calculateTotalExpenses(expenses, month, year);
    const savingsNet = calculateSavingsNet(savingsTx);
    const available = income.totalIncome - totalSpent - Math.max(savingsNet, 0);
    const remaining = income.totalIncome - totalSpent - Math.max(savingsNet, 0);

    const categorySpending = calculateCategorySpending(expenses, month, year);
    const dailySpending = calculateDailySpending(expenses, month, year);

    const todayStr = nowDate.toISOString().slice(0, 10);
    const todaySpending = expenses.filter(e => e.Date === todayStr).reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);

    const startOfWeek = new Date(nowDate);
    startOfWeek.setDate(nowDate.getDate() - nowDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekSpending = expenses.filter(e => {
      const d = new Date(e.Date);
      return d >= startOfWeek && d <= nowDate;
    }).reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);

    const budgetStatus = budgets
      .filter(b => parseInt(b.Month) === month && parseInt(b.Year) === year)
      .map(b => {
        const spent = categorySpending[b.Category] || 0;
        const limit = parseFloat(b.BudgetLimit) || 0;
        const pct = limit > 0 ? (spent / limit) * 100 : 0;
        return {
          ...b,
          spent,
          remaining: limit - spent,
          percentage: pct,
          status: calculateBudgetStatus(spent, limit),
        };
      });

    const recentExpenses = expenses
      .filter(e => e.Date)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date))
      .slice(0, 8);

    const upcomingRecurring = recurring
      .filter(r => r.Status === 'Active')
      .sort((a, b) => new Date(a.NextPaymentDate) - new Date(b.NextPaymentDate))
      .slice(0, 6);

    const goalStatus = goals.map(g => {
      const saved = calculateSavingsNet(savingsTx, g.ID);
      const target = parseFloat(g.TargetAmount) || 0;
      return {
        ...g,
        saved,
        percentage: target > 0 ? (saved / target) * 100 : 0,
        remaining: Math.max(target - saved, 0),
      };
    });

    let topCategory = null;
    let maxSpend = 0;
    Object.entries(categorySpending).forEach(([cat, amt]) => {
      if (amt > maxSpend) { maxSpend = amt; topCategory = cat; }
    });

    let smartInsight = null;
    if (totalSpent > income.totalIncome && income.totalIncome > 0) {
      smartInsight = `You've spent more than your available pocket money this month. ${topCategory || 'One category'} is driving overspending.`;
    } else if (topCategory) {
      const topBudget = budgetStatus.find(b => b.Category === topCategory);
      if (topBudget && topBudget.percentage >= 75) {
        smartInsight = `Your ${topCategory} spending is approaching its budget limit (${Math.round(topBudget.percentage)}%).`;
      } else {
        smartInsight = `${topCategory} is your biggest spending category at ₹${Math.round(maxSpend)} this month.`;
      }
    } else if (expenses.length === 0) {
      smartInsight = 'No expenses yet this month. Add your first expense to start understanding your spending.';
    } else {
      smartInsight = `Your average daily spend is ₹${totalSpent > 0 ? Math.round(totalSpent / (nowDate.getDate() || 1)) : 0}.`;
    }

    const unreadNotifications = notifications.filter(n => n.ReadStatus !== 'Read').length;

    return ok(res, {
      summary: {
        pocketMoney: income.pocketMoney,
        additionalIncome: income.additionalIncome,
        totalAvailable: income.totalIncome,
        totalSpent,
        remaining,
        savings: savingsNet,
      },
      monthlySpending: totalSpent,
      todaySpending,
      weekSpending,
      topCategories: Object.entries(categorySpending)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      recentExpenses,
      budgetStatus,
      savingsGoals: goalStatus,
      upcomingRecurring,
      smartInsight,
      unreadNotifications,
      categories: categories.filter(c => c.Type !== 'Income').map(c => c.CategoryName).filter(Boolean),
      settings: settings[0] || null,
    });
  } catch (e) {
    return internalError(res, e);
  }
}
