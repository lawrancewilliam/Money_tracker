import { getGoogleAuth } from './lib/googleAuth.js';
import { findOrCreateSpreadsheet } from './lib/driveService.js';
import { ensureHeaders, readSheet } from './lib/sheetsService.js';
import { ok, internalError, mapError } from './lib/responses.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return mapError(res, 405, 'Method not allowed');
  try {
    getGoogleAuth();
    const spreadsheet = await findOrCreateSpreadsheet();
    await ensureHeaders(spreadsheet.id);
    const categories = await readSheet('Categories');

    const names = categories.map(c => c.CategoryName).filter(Boolean);
    if (names.length === 0) {
      const defaults = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Recharge / Subscription', 'Education', 'Health', 'Friends / Outing', 'Bills', 'Others'];
      ok(res, {
        connected: true,
        spreadsheetId: spreadsheet.id,
        categories: defaults.map(n => ({ id: n, name: n })),
      });
      return;
    }
    const existing = names[0];
    ok(res, {
      connected: true,
      spreadsheetId: spreadsheet.id,
      categories: categories.map(c => ({ id: c.ID, name: c.CategoryName })),
    });
  } catch (e) {
    internalError(res, e);
  }
}
