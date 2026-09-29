import { readSheet, appendRow, updateRowById, deleteRowById } from './lib/dbService.js';
import { getSupabase } from './lib/supabaseClient.js';
import { validateRecurring, sanitizeString } from './lib/validation.js';
import { ok, created, badRequest, notFound, mapError, internalError } from './lib/responses.js';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addInterval(dateStr, frequency) {
  switch (frequency) {
    case 'Weekly': return addDays(dateStr, 7);
    case 'Monthly': return addDays(dateStr, 30);
    case 'Quarterly': return addDays(dateStr, 90);
    case 'Yearly': return addDays(dateStr, 365);
    default: return addDays(dateStr, 30);
  }
}

export default async function handler(req, res) {
  try {
    getSupabase();

    if (req.method === 'GET') {
      const recurring = await readSheet('RecurringExpenses');
      return ok(res, { recurring });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const errors = validateRecurring(body);
      if (errors.length > 0) return badRequest(res, errors.join(', '));

      const start = body.StartDate || new Date().toISOString().slice(0, 10);
      const next = body.NextPaymentDate || start;

      const record = {
        ID: uuid(),
        ExpenseName: sanitizeString(body.ExpenseName),
        Amount: parseFloat(body.Amount),
        Category: body.Category,
        Frequency: body.Frequency,
        StartDate: start,
        NextPaymentDate: next,
        Status: body.Status || 'Active',
        CreatedAt: now(),
        UpdatedAt: now(),
      };
      const saved = await appendRow('RecurringExpenses', record);
      return created(res, { recurring: saved });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const existing = (await readSheet('RecurringExpenses')).find(r => r.ID === id);
      if (!existing) return notFound(res, 'Recurring expense not found');

      const updated = {
        ExpenseName: body.ExpenseName || existing.ExpenseName,
        Amount: body.Amount !== undefined ? parseFloat(body.Amount) : existing.Amount,
        Category: body.Category || existing.Category,
        Frequency: body.Frequency || existing.Frequency,
        StartDate: body.StartDate || existing.StartDate,
        NextPaymentDate: body.NextPaymentDate || existing.NextPaymentDate,
        Status: body.Status || existing.Status,
        UpdatedAt: now(),
      };
      const result = await updateRowById('RecurringExpenses', id, updated);
      return ok(res, { recurring: result });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      try {
        await deleteRowById('RecurringExpenses', id);
        return ok(res, { success: true });
      } catch (e) {
        return notFound(res, 'Recurring expense not found');
      }
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}
