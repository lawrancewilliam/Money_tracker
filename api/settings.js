import { readSheet, appendRow, updateRowById } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { getConfiguredFolderId } from './lib/driveService.js';
import { ok, mapError, internalError, badRequest } from './lib/responses.js';

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    const folderId = getConfiguredFolderId();
    const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;

    if (req.method === 'GET') {
      const settings = await readSheet('UserSettings');
      const active = settings[0] || null;
      return ok(res, { settings: active, status: 'connected', folderId, folderUrl });
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const all = await readSheet('UserSettings');

      const next = {
        Name: body.Name || '',
        Currency: body.Currency || 'INR',
        BudgetCycle: body.BudgetCycle || 'Monthly',
        PocketMoneyDate: body.PocketMoneyDate || '1',
        Theme: body.Theme || 'System',
        NotificationPreference: body.NotificationPreference !== undefined ? body.NotificationPreference : 'true',
        UpdatedAt: new Date().toISOString(),
      };

      if (all.length === 0) {
        const id = crypto.randomUUID();
        const saved = await appendRow('UserSettings', { ID: id, ...next });
        return ok(res, { settings: saved, status: 'connected', folderId, folderUrl });
      }

      const updated = await updateRowById('UserSettings', all[0].ID, next);
      return ok(res, { settings: updated, status: 'connected', folderId, folderUrl });
    }

    return mapError(res, 405, 'Method not allowed');
  } catch (e) {
    return internalError(res, e);
  }
}
