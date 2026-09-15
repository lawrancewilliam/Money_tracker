import { readSheet, appendRow, updateRowById, deleteRowById } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { validateExpense, sanitizeString, isValidDate } from './lib/validation.js';
import { ok, created, badRequest, notFound, mapError, internalError } from './lib/responses.js';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method === 'GET') {
      const expenses = await readSheet('Expenses');
      return ok(res, { expenses: expenses.reverse() });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const errors = validateExpense(body);
      if (errors.length > 0) return badRequest(res, errors.join(', '));

      const expense = {
        ID: uuid(),
        Date: body.Date,
        Time: body.Time || new Date().toLocaleTimeString(),
        ExpenseName: sanitizeString(body.ExpenseName),
        Category: body.Category,
        Amount: parseFloat(body.Amount),
        PaymentMethod: body.PaymentMethod || 'Cash',
        Notes: sanitizeString(body.Notes),
        CreatedAt: now(),
        UpdatedAt: now(),
      };

      const saved = await appendRow('Expenses', expense);
      return created(res, { expense: saved });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const errors = validateExpense(body);
      if (errors.length > 0) return badRequest(res, errors.join(', '));

      const updated = {
        Date: body.Date,
        Time: body.Time || '',
        ExpenseName: sanitizeString(body.ExpenseName),
        Category: body.Category,
        Amount: parseFloat(body.Amount),
        PaymentMethod: body.PaymentMethod,
        Notes: sanitizeString(body.Notes),
        UpdatedAt: now(),
      };

      try {
        const result = await updateRowById('Expenses', id, updated);
        return ok(res, { expense: result });
      } catch (e) {
        return notFound(res, 'Expense not found');
      }
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      try {
        await deleteRowById('Expenses', id);
        return ok(res, { success: true });
      } catch (e) {
        return notFound(res, 'Expense not found');
      }
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}
