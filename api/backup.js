import { readSheet } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { uploadBackupFile } from './lib/driveService.js';
import { ok, mapError, internalError } from './lib/responses.js';

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method !== 'POST') return mapError(res, 405, 'Method not allowed');

    const data = {
      exportedAt: new Date().toISOString(),
      app: 'Pocket Money Smart Budget Tracker',
      pocketMoney: await readSheet('PocketMoney'),
      income: await readSheet('Income'),
      expenses: await readSheet('Expenses'),
      categories: await readSheet('Categories'),
      budgets: await readSheet('Budgets'),
      savingsGoals: await readSheet('SavingsGoals'),
      savingsTransactions: await readSheet('SavingsTransactions'),
      recurringExpenses: await readSheet('RecurringExpenses'),
      notifications: await readSheet('Notifications'),
      userSettings: await readSheet('UserSettings'),
    };

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const fileName = `PocketMoneyBackup-${timestamp}.json`;

    const uploaded = await uploadBackupFile(fileName, data);

    return ok(res, { success: true, file: uploaded });
  } catch (e) {
    return internalError(res, e);
  }
}
