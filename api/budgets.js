import { readSheet, appendRow, updateRowById, deleteRowById } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { validateBudget, sanitizeString } from './lib/validation.js';
import { ok, created, badRequest, notFound, mapError, internalError } from './lib/responses.js';
import { getMonthYear } from './lib/financialCalculations.js';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method === 'GET') {
      const budgets = await readSheet('Budgets');
      return ok(res, { budgets });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const errors = validateBudget(body);
      if (errors.length > 0) return badRequest(res, errors.join(', '));
      const { month, year } = getMonthYear(new Date());

      const record = {
        ID: uuid(),
        Month: month,
        Year: year,
        Category: body.Category,
        BudgetLimit: parseFloat(body.BudgetLimit),
        CreatedAt: now(),
        UpdatedAt: now(),
      };
      const saved = await appendRow('Budgets', record);
      return created(res, { budget: saved });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const updated = {
        Category: body.Category,
        BudgetLimit: parseFloat(body.BudgetLimit),
        UpdatedAt: now(),
      };
      try {
        const result = await updateRowById('Budgets', id, updated);
        return ok(res, { budget: result });
      } catch (e) {
        return notFound(res, 'Budget not found');
      }
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      try {
        await deleteRowById('Budgets', id);
        return ok(res, { success: true });
      } catch (e) {
        return notFound(res, 'Budget not found');
      }
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}
