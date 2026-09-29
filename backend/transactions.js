import { readSheet } from './lib/dbService.js';
import { getSupabase } from './lib/supabaseClient.js';
import { ok, mapError, internalError } from './lib/responses.js';

export default async function handler(req, res) {
  try {
    getSupabase();

    if (req.method !== 'GET') return mapError(res, 405, 'Method not allowed');

    const expenses = await readSheet('Expenses');
    const income = await readSheet('Income');
    const goals = await readSheet('SavingsGoals');
    const budgetRecords = await readSheet('Budgets');

    const transactions = [];

    expenses.forEach(e => {
      transactions.push({
        ID: e.ID,
        Name: e.ExpenseName,
        Type: 'Expense',
        Category: e.Category,
        Amount: parseFloat(e.Amount) || 0,
        PaymentMethod: e.PaymentMethod,
        Date: e.Date,
        Time: e.Time,
        CreatedAt: e.CreatedAt,
      });
    });

    income.forEach(i => {
      transactions.push({
        ID: i.ID,
        Name: i.Source,
        Type: 'Income',
        Category: i.Source,
        Amount: parseFloat(i.Amount) || 0,
        PaymentMethod: 'Received',
        Date: i.Date,
        Time: '',
        CreatedAt: i.CreatedAt,
      });
    });

    goals.forEach(g => {
      transactions.push({
        ID: g.ID,
        Name: g.GoalName,
        Type: 'Savings',
        Category: 'Savings',
        Amount: -1 * (parseFloat(g.TargetAmount) || 0),
        PaymentMethod: 'Allocated',
        Date: g.CreatedAt ? g.CreatedAt.slice(0, 10) : '',
        Time: '',
        CreatedAt: g.CreatedAt,
      });
    });

    transactions.sort((a, b) => new Date(b.Date || b.CreatedAt) - new Date(a.Date || a.CreatedAt));

    return ok(res, { transactions });
  } catch (e) {
    return internalError(res, e);
  }
}
