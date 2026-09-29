import { readSheet, appendRow, updateRowById, deleteRowById } from './lib/dbService.js';
import { getSupabase } from './lib/supabaseClient.js';
import { validateIncome, sanitizeString } from './lib/validation.js';
import { ok, created, badRequest, notFound, mapError, internalError } from './lib/responses.js';
import { getMonthYear, calculateTotalIncome, calculateTotalExpenses } from './lib/financialCalculations.js';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export default async function handler(req, res) {
  try {
    getSupabase();

    if (req.method === 'GET') {
      const income = await readSheet('Income');
      return ok(res, { income: income.reverse() });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (body.type === 'pocketMoney') {
        return handlePocketMoney(req, res, body);
      }
      const errors = validateIncome(body);
      if (errors.length > 0) return badRequest(res, errors.join(', '));

      const record = {
        ID: uuid(),
        Date: body.Date,
        Source: body.Source || 'Additional',
        Amount: parseFloat(body.Amount),
        Notes: sanitizeString(body.Notes),
        CreatedAt: now(),
        UpdatedAt: now(),
      };
      const saved = await appendRow('Income', record);
      return ok(res, { income: saved });
    }

    if (req.method === 'PUT') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const updated = {
        Date: body.Date,
        Source: body.Source,
        Amount: parseFloat(body.Amount),
        Notes: sanitizeString(body.Notes),
        UpdatedAt: now(),
      };
      try {
        const result = await updateRowById('Income', id, updated);
        return ok(res, { income: result });
      } catch (e) {
        return notFound(res, 'Income not found');
      }
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return badRequest(res, 'Missing id');
      try {
        await deleteRowById('Income', id);
        return ok(res, { success: true });
      } catch (e) {
        return notFound(res, 'Income not found');
      }
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}

async function handlePocketMoney(req, res, body) {
  const pocketMoneyData = await readSheet('PocketMoney');
  const { month, year } = getMonthYear(new Date());

  const existing = pocketMoneyData.find(p => parseInt(p.Month) === month && parseInt(p.Year) === year);

  const amount = parseFloat(body.PocketMoney);
  if (isNaN(amount) || amount < 0) return badRequest(res, 'Invalid pocket money amount');

  if (existing) {
    const updated = await updateRowById('PocketMoney', existing.ID, {
      PocketMoney: amount,
      ReceivedDate: body.ReceivedDate || existing.ReceivedDate,
      UpdatedAt: now(),
    });
    return ok(res, { pocketMoney: updated });
  }

  const record = {
    ID: uuid(),
    Month: month,
    Year: year,
    PocketMoney: amount,
    ReceivedDate: body.ReceivedDate || new Date().toISOString().slice(0, 10),
    CreatedAt: now(),
    UpdatedAt: now(),
  };
  const saved = await appendRow('PocketMoney', record);
  return created(res, { pocketMoney: saved });
}
