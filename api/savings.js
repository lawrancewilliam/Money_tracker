import { readSheet, appendRow, updateRowById, deleteRowById } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { validateSavingsGoal, validateSavingsTransaction, sanitizeString } from './lib/validation.js';
import { ok, created, badRequest, notFound, mapError, internalError } from './lib/responses.js';
import { calculateSavingsNet } from './lib/financialCalculations.js';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const timeNow = () => new Date().toLocaleTimeString();

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method === 'GET') {
      const goals = await readSheet('SavingsGoals');
      const txs = await readSheet('SavingsTransactions');
      const enriched = goals.map(g => ({
        ...g,
        SavedAmount: calculateSavingsNet(txs, g.ID),
      }));
      return ok(res, {
        goals: enriched,
        transactions: txs,
        totalSavings: calculateSavingsNet(txs),
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (body.action === 'transaction') {
        const errors = validateSavingsTransaction(body);
        if (errors.length > 0) return badRequest(res, errors.join(', '));

        const txs = await readSheet('SavingsTransactions');
        const amount = parseFloat(body.Amount);
        const goalId = body.GoalID ? String(body.GoalID).trim() : '';

        if (goalId) {
          const goal = (await readSheet('SavingsGoals')).find(g => g.ID === goalId);
          if (!goal) return notFound(res, 'Goal not found');

          if (body.Type === 'Withdrawal') {
            const goalNet = calculateSavingsNet(txs, goalId);
            if (amount > goalNet) return badRequest(res, 'Withdrawal amount cannot exceed the amount saved toward this goal.');
          }
        } else if (body.Type === 'Withdrawal') {
          const totalNet = calculateSavingsNet(txs);
          if (totalNet < 0 || amount > totalNet) return badRequest(res, 'Withdrawal amount cannot exceed your current savings.');
        }

        const record = {
          ID: uuid(),
          GoalID: goalId,
          Date: body.Date || today(),
          Type: body.Type,
          Amount: amount,
          Notes: sanitizeString(body.Notes),
          CreatedAt: now(),
          Time: body.Time || timeNow(),
          UpdatedAt: now(),
        };
        const saved = await appendRow('SavingsTransactions', record);

        const allAfterTxs = [...txs, record];
        const totalSavingsAfter = calculateSavingsNet(allAfterTxs);

        if (goalId) {
          const goal = (await readSheet('SavingsGoals')).find(g => g.ID === goalId);
          const net = calculateSavingsNet(allAfterTxs, goalId);
          const target = parseFloat(goal.TargetAmount) || 0;
          if (body.Type === 'Deposit' && target > 0 && net >= target) {
            await updateRowById('SavingsGoals', goalId, { Status: 'Completed', UpdatedAt: now() });
          }
          return created(res, { transaction: saved, goalId, totalSavings: totalSavingsAfter });
        }

        return created(res, { transaction: saved, totalSavings: totalSavingsAfter });
      }

      const errors = validateSavingsGoal(body);
      if (errors.length > 0) return badRequest(res, errors.join(', '));

      const goal = {
        ID: uuid(),
        GoalName: body.GoalName,
        TargetAmount: parseFloat(body.TargetAmount),
        TargetDate: body.TargetDate || '',
        Status: 'Active',
        Icon: body.Icon || '🎯',
        Description: sanitizeString(body.Description),
        CreatedAt: now(),
        UpdatedAt: now(),
      };
      const saved = await appendRow('SavingsGoals', goal);
      return created(res, { goal: saved });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const existing = (await readSheet('SavingsGoals')).find(g => g.ID === id);
      if (!existing) return notFound(res, 'Goal not found');

      if (body.action === 'delete') {
        await deleteRowById('SavingsGoals', id);
        return ok(res, { success: true });
      }

      const updated = {
        GoalName: body.GoalName || existing.GoalName,
        TargetAmount: body.TargetAmount !== undefined ? parseFloat(body.TargetAmount) : (parseFloat(existing.TargetAmount) || 0),
        TargetDate: body.TargetDate !== undefined ? body.TargetDate : existing.TargetDate,
        Status: body.Status || existing.Status,
        Icon: body.Icon !== undefined ? body.Icon : existing.Icon,
        Description: body.Description !== undefined ? sanitizeString(body.Description) : existing.Description,
        UpdatedAt: now(),
      };

      const result = await updateRowById('SavingsGoals', id, updated);
      return ok(res, { goal: result });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      try {
        await deleteRowById('SavingsGoals', id);
        return ok(res, { success: true });
      } catch (e) {
        return notFound(res, 'Goal not found');
      }
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}