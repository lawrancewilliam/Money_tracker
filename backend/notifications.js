import { readSheet, appendRow, updateRowById, deleteRowById } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { ok, created, badRequest, mapError, internalError } from './lib/responses.js';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method === 'GET') {
      const notifications = await readSheet('Notifications');
      const sorted = notifications.sort((a, b) => (new Date(b.CreatedAt) - new Date(a.CreatedAt)));
      return ok(res, { notifications: sorted });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (body.action === 'generate') {
        return generateNotifications(req, res);
      }
      const record = {
        ID: uuid(),
        Date: body.Date || new Date().toISOString().slice(0, 10),
        Type: body.Type || 'Info',
        Message: body.Message || '',
        ReadStatus: body.ReadStatus || 'Unread',
        CreatedAt: now(),
      };
      const saved = await appendRow('Notifications', record);
      return created(res, { notification: saved });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const existing = (await readSheet('Notifications')).find(n => n.ID === id);
      if (!existing) return badRequest(res, 'Notification not found');

      if (body.action === 'markAllRead') {
        const all = await readSheet('Notifications');
        for (const n of all) {
          if (n.ReadStatus !== 'Read') {
            await updateRowById('Notifications', n.ID, { ReadStatus: 'Read' });
          }
        }
        return ok(res, { success: true });
      }

      const updated = await updateRowById('Notifications', id, {
        ReadStatus: body.ReadStatus || existing.ReadStatus,
      });
      return ok(res, { notification: updated });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      if (id === 'all') {
        const all = await readSheet('Notifications');
        for (const n of all) await deleteRowById('Notifications', n.ID);
        return ok(res, { success: true });
      }
      try {
        await deleteRowById('Notifications', id);
        return ok(res, { success: true });
      } catch (e) {
        return notFound(res, 'Notification not found');
      }
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}

async function generateNotifications(req, res) {
  const expenses = await readSheet('Expenses');
  const budgets = await readSheet('Budgets');
  const goals = await readSheet('SavingsGoals');
  const pocketMoney = await readSheet('PocketMoney');
  const recurring = await readSheet('RecurringExpenses');

  const nowDate = new Date();
  const month = nowDate.getMonth() + 1;
  const year = nowDate.getFullYear();
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.Date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const messages = [];

  for (const b of budgets) {
    if (parseInt(b.Month) !== month || parseInt(b.Year) !== year) continue;
    const spent = monthExpenses.filter(e => e.Category === b.Category).reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
    const limit = parseFloat(b.BudgetLimit);
    if (limit > 0) {
      const pct = (spent / limit) * 100;
      if (pct >= 100) messages.push({ type: 'BudgetExceeded', message: `You exceeded your ${b.Category} budget this month.` });
      else if (pct >= 90) messages.push({ type: 'BudgetAlmost', message: `Your ${b.Category} budget is almost exhausted (${Math.round(pct)}%).` });
      else if (pct >= 75) messages.push({ type: 'BudgetWarning', message: `Your ${b.Category} spending reached ${Math.round(pct)}% of the budget.` });
      else if (pct >= 50) messages.push({ type: 'Budget50', message: `You've used 50% of your ${b.Category} budget.` });
    }
  }

  const totalSpent = monthExpenses.reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
  const pm = pocketMoney.find(p => parseInt(p.Month) === month && parseInt(p.Year) === year);
  const balance = pm ? (parseFloat(pm.PocketMoney) || 0) - totalSpent : 0;
  if (balance < 500 && balance > 0) {
    messages.push({ type: 'LowBalance', message: `Your available balance is low (₹${Math.round(balance)}). Consider slowing down.` });
  }
  if (balance <= 0) {
    messages.push({ type: 'LowBalance', message: 'Your available balance has run out this month.' });
  }

  const dueSoon = recurring.filter(r => {
    if (r.Status !== 'Active') return false;
    const next = new Date(r.NextPaymentDate);
    const diff = (next - nowDate) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  for (const r of dueSoon) {
    messages.push({ type: 'RecurringDue', message: `${r.ExpenseName} of ₹${parseFloat(r.Amount)} is due in the next few days.` });
  }

  const currentPm = pocketMoney.find(p => parseInt(p.Month) === month && parseInt(p.Year) === year);
  const currentMonthSpent = monthExpenses.reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayOfMonth = nowDate.getDate();
  if (currentPm && dayOfMonth > 0) {
    const projected = (currentMonthSpent / dayOfMonth) * daysInMonth;
    if (currentPm && parseFloat(currentPm.PocketMoney) > 0) {
      const projectedBalance = parseFloat(currentPm.PocketMoney) - projected;
      if (projectedBalance < 0) {
        messages.push({ type: 'Projection', message: `At your current pace, you may end the month ₹${Math.round(Math.abs(projectedBalance))} in the negative.` });
      }
    }
  }

  const existing = await readSheet('Notifications');
  for (const m of messages) {
    const dup = existing.find(n => n.Message === m.message);
    if (dup) continue;
    await appendRow('Notifications', {
      ID: uuid(),
      Date: new Date().toISOString().slice(0, 10),
      Type: m.type,
      Message: m.message,
      ReadStatus: 'Unread',
      CreatedAt: now(),
    });
  }

  return ok(res, { generated: messages.length });
}
