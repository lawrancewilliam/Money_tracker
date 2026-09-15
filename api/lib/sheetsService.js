import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth.js';
import { getSpreadsheetId } from './driveService.js';

const HEADERS = {
  PocketMoney: ['ID', 'Month', 'Year', 'PocketMoney', 'ReceivedDate', 'CreatedAt', 'UpdatedAt'],
  Income: ['ID', 'Date', 'Source', 'Amount', 'Notes', 'CreatedAt', 'UpdatedAt'],
  Expenses: ['ID', 'Date', 'Time', 'ExpenseName', 'Category', 'Amount', 'PaymentMethod', 'Notes', 'CreatedAt', 'UpdatedAt'],
  Categories: ['ID', 'CategoryName', 'Icon', 'Type', 'IsDefault'],
  Budgets: ['ID', 'Month', 'Year', 'Category', 'BudgetLimit', 'CreatedAt', 'UpdatedAt'],
  SavingsGoals: ['ID', 'GoalName', 'TargetAmount', 'TargetDate', 'Status', 'Icon', 'Description', 'CreatedAt', 'UpdatedAt'],
  SavingsTransactions: ['ID', 'GoalID', 'Date', 'Type', 'Amount', 'Notes', 'CreatedAt', 'Time', 'UpdatedAt'],
  RecurringExpenses: ['ID', 'ExpenseName', 'Amount', 'Category', 'Frequency', 'StartDate', 'NextPaymentDate', 'Status', 'CreatedAt', 'UpdatedAt'],
  Notifications: ['ID', 'Date', 'Type', 'Message', 'ReadStatus', 'CreatedAt'],
  UserSettings: ['Name', 'Currency', 'BudgetCycle', 'PocketMoneyDate', 'Theme', 'NotificationPreference', 'UpdatedAt'],
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

export function getHeaders(sheetName) {
  return HEADERS[sheetName] || [];
}

function newSheetsClient() {
  return google.sheets({ version: 'v4', auth: getGoogleAuth() });
}

function describeSheetError(e, label) {
  const status = e?.response?.status || (typeof e?.code === 'number' ? e?.code : null);
  const reason = e?.errors?.[0]?.reason;
  const message = e?.errors?.[0]?.message || e?.message || '';
  if (reason === 'invalid_grant') {
    return 'Google Auth Error: Invalid service account credentials — Google rejected the email/private key pair. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.';
  }
  if (status === 429 || reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded') {
    return 'Google Sheets Error: Rate limit exceeded. Retry in a few seconds.';
  }
  if (reason === 'storageQuotaExceeded' || /storage/i.test(message)) {
    return 'Google Sheets Error: The service account has no Drive storage quota available, so the app cannot create new spreadsheets. It uses the existing spreadsheet configured via GOOGLE_SPREADSHEET_ID.';
  }
  if (status === 404) {
    return `Google Sheets Error: ${label} was not found. Verify GOOGLE_SPREADSHEET_ID and that the spreadsheet is shared with the service account using Editor access.`;
  }
  if (status === 403) {
    return `Google Sheets Error: Permission denied on ${label}. Share the spreadsheet/folder with the service account (GOOGLE_SERVICE_ACCOUNT_EMAIL) using Editor access.`;
  }
  return `Google Sheets Error (${label}): ${message || 'Unknown Google Sheets API error'}`;
}

async function sheetRequest(label, fn) {
  try {
    return await fn();
  } catch (e) {
    throw new Error(describeSheetError(e, label), { cause: e });
  }
}

async function getSheetObject() {
  const spreadsheetId = await getSpreadsheetId();
  return { sheets: newSheetsClient(), spreadsheetId };
}

export async function ensureHeaders(spreadsheetId) {
  const sheets = newSheetsClient();

  const spreadsheet = await sheetRequest('spreadsheet metadata', () =>
    sheets.spreadsheets.get({ spreadsheetId })
  );
  const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

  const requests = [];
  for (const [sheetName] of Object.entries(HEADERS)) {
    if (!existingSheets.includes(sheetName)) {
      requests.push({ addSheet: { properties: { title: sheetName } } });
    }
  }

  if (requests.length > 0) {
    await sheetRequest('spreadsheet tabs', () =>
      sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } })
    );
  }

  for (const [sheetName, headers] of Object.entries(HEADERS)) {
    const res = await sheetRequest(`sheet "${sheetName}"`, () =>
      sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A1:Z1` })
    );
    if (!res.data.values || res.data.values.length === 0) {
      await sheetRequest(`sheet "${sheetName}"`, () =>
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: [headers] },
        })
      );
    }
  }

  const catRes = await sheetRequest('Categories', () =>
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Categories!A2:D' })
  );
  if (!catRes.data.values || catRes.data.values.length === 0) {
    const catRows = DEFAULT_CATEGORIES.map((cat, i) => [
      crypto.randomUUID(), cat.name, cat.icon, 'Expense',
    ]);
    await sheetRequest('Categories', () =>
      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Categories!A:D',
        valueInputOption: 'RAW',
        requestBody: { values: catRows },
      })
    );
  }
}

export async function readSheet(sheetName) {
  const { sheets, spreadsheetId } = await getSheetObject();
  const res = await sheetRequest(`sheet "${sheetName}"`, () =>
    sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:Z` })
  );

  if (!res.data.values || res.data.values.length <= 1) return [];
  const headers = res.data.values[0];
  return res.data.values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}

export async function appendRow(sheetName, data) {
  const { sheets, spreadsheetId } = await getSheetObject();
  const headers = HEADERS[sheetName];
  const row = headers.map(h => data[h] !== undefined && data[h] !== null ? data[h] : '');
  await sheetRequest(`sheet "${sheetName}"`, () =>
    sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  );
  return data;
}

export async function updateRowById(sheetName, id, data) {
  const { sheets, spreadsheetId } = await getSheetObject();
  const rows = await readSheet(sheetName);
  const headers = HEADERS[sheetName];
  const rowIndex = rows.findIndex(r => r.ID === id);
  if (rowIndex === -1) throw new Error('Row not found');
  const rowNumber = rowIndex + 2;
  const row = headers.map(h => data[h] !== undefined && data[h] !== null ? data[h] : (rows[rowIndex][h] || ''));
  await sheetRequest(`sheet "${sheetName}"`, () =>
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    })
  );
  return { ...rows[rowIndex], ...data, ID: id };
}

export async function clearSheetRows(sheetName) {
  const { sheets, spreadsheetId } = await getSheetObject();
  const res = await sheetRequest(`sheet "${sheetName}"`, () =>
    sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A2:Z` })
  );
  const rows = res.data.values || [];
  if (rows.length > 0) {
    await sheetRequest(`sheet "${sheetName}"`, () =>
      sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A2:Z` })
    );
  }
  return rows.length;
}

export async function deleteRowById(sheetName, id) {
  const { sheets, spreadsheetId } = await getSheetObject();
  const rows = await readSheet(sheetName);
  const rowIndex = rows.findIndex(r => r.ID === id);
  if (rowIndex === -1) throw new Error('Row not found');
  const sheetId = await getSheetId(spreadsheetId, sheetName);
  await sheetRequest(`sheet "${sheetName}"`, () =>
    sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 },
          },
        }],
      },
    })
  );
}

export async function findRowById(sheetName, id) {
  const rows = await readSheet(sheetName);
  return rows.find(r => r.ID === id) || null;
}

async function getSheetId(spreadsheetId, sheetName) {
  const sheets = newSheetsClient();
  const spreadsheet = await sheetRequest('spreadsheet metadata', () =>
    sheets.spreadsheets.get({ spreadsheetId })
  );
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
  return sheet.properties.sheetId;
}