import { ensureStorage, readSheet } from './lib/dbService.js';
import { getSupabase, getProjectUrl } from './lib/supabaseClient.js';
import { ok, internalError, mapError } from './lib/responses.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return mapError(res, 405, 'Method not allowed');
  try {
    getSupabase();
    await ensureStorage();

    const categories = await readSheet('Categories');

    const names = categories.map(c => c.CategoryName).filter(Boolean);
    if (names.length === 0) {
      const defaults = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Recharge / Subscription', 'Education', 'Health', 'Friends / Outing', 'Bills', 'Others'];
      ok(res, {
        connected: true,
        projectId: getProjectUrl(),
        categories: defaults.map(n => ({ id: n, name: n })),
      });
      return;
    }
    ok(res, {
      connected: true,
      projectId: getProjectUrl(),
      categories: categories.map(c => ({ id: c.ID, name: c.CategoryName })),
    });
  } catch (e) {
    internalError(res, e);
  }
}
