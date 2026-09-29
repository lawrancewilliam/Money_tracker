import { clearSheetRows } from './lib/dbService.js';
import { getSupabase } from './lib/supabaseClient.js';
import { ok, badRequest, mapError, internalError } from './lib/responses.js';

const RESETABLE_SHEETS = {
  PocketMoney: 'PocketMoney',
  Income: 'Income',
  Expenses: 'Expenses',
  Budgets: 'Budgets',
  SavingsGoals: 'SavingsGoals',
  SavingsTransactions: 'SavingsTransactions',
  RecurringExpenses: 'RecurringExpenses',
  Notifications: 'Notifications',
};

export default async function handler(req, res) {
  try {
    getSupabase();

    if (req.method !== 'POST') return mapError(res, 405, 'Method not allowed');

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const requested = Array.isArray(body.sheets) ? body.sheets : Array.isArray(body.targets) ? body.targets : [];

    const selected = [...new Set(requested)].filter(s => RESETABLE_SHEETS[s]);
    if (selected.length === 0) {
      return badRequest(res, 'No resetable sheets selected');
    }

    const cleared = {};
    for (const sheet of selected) {
      cleared[sheet] = await clearSheetRows(sheet);
    }

    return ok(res, { success: true, cleared });
  } catch (e) {
    return internalError(res, e);
  }
}