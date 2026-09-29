import { getSupabase } from './supabaseClient.js';

export const SHEET_TO_TABLE = {
  PocketMoney: 'pocket_money',
  Income: 'income',
  Expenses: 'expenses',
  Categories: 'categories',
  Budgets: 'budgets',
  SavingsGoals: 'savings_goals',
  SavingsTransactions: 'savings_transactions',
  RecurringExpenses: 'recurring_expenses',
  Notifications: 'notifications',
  UserSettings: 'user_settings',
  Backups: 'backups',
};

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍽️' },
  { name: 'Travel', icon: '🚌' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Recharge / Subscription', icon: '📱' },
  { name: 'Education', icon: '📚' },
  { name: 'Health', icon: '💊' },
  { name: 'Friends / Outing', icon: '👥' },
  { name: 'Bills', icon: '📄' },
  { name: 'Others', icon: '📦' },
];

const ALL_ROWS_FILTER = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

function tableFor(sheetName) {
  const table = SHEET_TO_TABLE[sheetName];
  if (!table) throw new Error(`Supabase Error: Unknown table "${sheetName}".`);
  return table;
}

function describeDbError(error, label) {
  const message = error?.message || 'Unknown Supabase error';
  const code = error?.code || '';
  if (code === '42501' || /row-level security/i.test(message)) {
    return `Supabase Error: Permission denied on ${label}. Check the table policies and that SUPABASE_URL / keys are correct.`;
  }
  if (code === '23505') {
    return `Supabase Error: Duplicate key on ${label}.`;
  }
  if (code === '22P02' || /invalid input syntax/i.test(message)) {
    return `Supabase Error: Invalid value written to ${label}: ${message}`;
  }
  if (code === '42P01' || /does not exist/i.test(message)) {
    return `Supabase Error: Table for ${label} does not exist. Run supabase/schema.sql in the Supabase SQL Editor.`;
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|network/i.test(message)) {
    return `Supabase Error: Could not reach the project (${label}). Check SUPABASE_URL.`;
  }
  return `Supabase Error (${label}): ${message}`;
}

async function query(label, fn) {
  const { data, error } = await fn(getSupabase());
  if (error) throw new Error(describeDbError(error, label), { cause: error });
  return data;
}

function normalize(row) {
  const out = {};
  for (const [k, v] of Object.entries(row || {})) {
    out[k] = v === null || v === undefined ? '' : v;
  }
  return out;
}

function toPayload(data) {
  const payload = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (v === undefined || v === null) continue;
    payload[k] = v;
  }
  return payload;
}

export async function ensureStorage() {
  const supabase = getSupabase();

  const { data, error: readError } = await supabase.from('categories').select('"ID"').limit(1);
  if (readError) throw new Error(describeDbError(readError, 'Categories'), { cause: readError });

  if (!data || data.length === 0) {
    const rows = DEFAULT_CATEGORIES.map(cat => ({
      CategoryName: cat.name,
      Icon: cat.icon,
      Type: 'Expense',
      IsDefault: 'true',
    }));
    const { error: insertError } = await supabase.from('categories').insert(rows);
    if (insertError) throw new Error(describeDbError(insertError, 'Categories'), { cause: insertError });
  }

  return true;
}

export async function readSheet(sheetName) {
  const table = tableFor(sheetName);
  const rows = await query(`sheet "${sheetName}"`, (sb) =>
    sb.from(table).select('*')
  );
  return (rows || []).map(normalize);
}

export async function appendRow(sheetName, data) {
  const table = tableFor(sheetName);
  const payload = toPayload(data);
  const rows = await query(`sheet "${sheetName}"`, (sb) =>
    sb.from(table).insert(payload).select('*')
  );
  return rows && rows[0] ? normalize(rows[0]) : data;
}

export async function updateRowById(sheetName, id, data) {
  const table = tableFor(sheetName);
  const payload = toPayload(data);
  const rows = await query(`sheet "${sheetName}"`, (sb) =>
    sb.from(table).update(payload).eq('ID', id).select('*')
  );
  if (!rows || rows.length === 0) throw new Error('Row not found');
  return normalize(rows[0]);
}

export async function deleteRowById(sheetName, id) {
  const table = tableFor(sheetName);
  const rows = await query(`sheet "${sheetName}"`, (sb) =>
    sb.from(table).delete().eq('ID', id).select('"ID"')
  );
  if (!rows || rows.length === 0) throw new Error('Row not found');
}

export async function findRowById(sheetName, id) {
  const rows = await readSheet(sheetName);
  return rows.find(r => r.ID === id) || null;
}

export async function clearSheetRows(sheetName) {
  const table = tableFor(sheetName);
  const existing = await readSheet(sheetName);
  if (existing.length === 0) return 0;
  await query(`sheet "${sheetName}"`, (sb) =>
    sb.from(table).delete().neq('ID', ALL_ROWS_FILTER).select('"ID"')
  );
  return existing.length;
}

export async function saveBackup(fileName, content) {
  const rows = await query('backups', (sb) =>
    sb.from('backups').insert({ FileName: fileName, Content: content, CreatedAt: new Date().toISOString() }).select('*')
  );
  return rows && rows[0]
    ? { id: rows[0].ID, name: rows[0].FileName }
    : { id: '', name: fileName };
}
