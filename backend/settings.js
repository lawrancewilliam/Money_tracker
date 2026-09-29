import { readSheet, appendRow, updateRowById } from './lib/dbService.js';
import { getSupabase, getProjectUrl } from './lib/supabaseClient.js';
import { ok, mapError, internalError } from './lib/responses.js';

export default async function handler(req, res) {
  try {
    getSupabase();

    const status = 'connected';
    const projectUrl = getProjectUrl();

    if (req.method === 'GET') {
      const settings = await readSheet('UserSettings');
      const active = settings[0] || null;
      return ok(res, { settings: active, status, projectUrl });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const all = await readSheet('UserSettings');
      const existing = all[0] || {};

      const pick = (key, fallback) =>
        body[key] !== undefined && body[key] !== null ? body[key] : (existing[key] || fallback);

      const next = {
        Name: pick('Name', ''),
        Currency: pick('Currency', 'INR'),
        BudgetCycle: pick('BudgetCycle', 'Monthly'),
        PocketMoneyDate: pick('PocketMoneyDate', '1'),
        Theme: pick('Theme', 'System'),
        NotificationPreference: pick('NotificationPreference', 'true'),
        UpdatedAt: new Date().toISOString(),
      };

      if (all.length === 0) {
        const id = crypto.randomUUID();
        const saved = await appendRow('UserSettings', { ID: id, ...next });
        return ok(res, { settings: saved, status, projectUrl });
      }

      const updated = await updateRowById('UserSettings', existing.ID, next);
      return ok(res, { settings: updated, status, projectUrl });
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}
