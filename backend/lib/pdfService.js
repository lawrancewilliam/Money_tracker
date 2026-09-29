import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import * as fontkit from 'fontkit';
import { readSheet } from './dbService.js';
import { calculateSavingsNet } from './financialCalculations.js';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_L = 45;
const MARGIN_R = 45;
const CONTENT_W = PAGE_WIDTH - MARGIN_L - MARGIN_R;
const HEADER_TOP = 52;
const BOTTOM_PAD = 62;
const NAVY = '#1E293B';
const GRAY = '#6B7280';
const PURPLE = '#6C4BFF';
const VIOLET_DARK = '#4A3A80';
const HEADER_FILL = '#F3F0FF';
const STRIPE_FILL = '#F8F7FF';
const LINE_COLOR = '#E6E2F0';

function resolveFonts() {
  const candidates = [];
  if (process.platform === 'win32') {
    candidates.push(['C:/Windows/Fonts/arial.ttf', 'C:/Windows/Fonts/arialbd.ttf']);
  } else if (process.platform === 'darwin') {
    candidates.push(['/Library/Fonts/Arial.ttf', '/Library/Fonts/Arial Bold.ttf']);
  } else {
    const dirs = fs.existsSync('/usr/share/fonts/truetype/msttcorefonts')
      ? ['/usr/share/fonts/truetype/msttcorefonts']
      : ['/usr/share/fonts/truetype/liberation'];
    for (const dir of dirs) {
      const reg = path.join(dir, 'LiberationSans-Regular.ttf');
      const bld = path.join(dir, 'LiberationSans-Bold.ttf');
      if (fs.existsSync(reg) && fs.existsSync(bld)) candidates.push([reg, bld]);
    }
  }
  for (const [reg, bld] of candidates) {
    if (fs.existsSync(reg) && fs.existsSync(bld)) return { body: reg, bold: bld };
  }
  return null;
}

let rupeeSign = null;
let rupeeSignChecked = false;

export function getCurrencySign() {
  const fonts = resolveFonts();
  if (fonts) {
    try {
      const font = fontkit.openSync(fonts.body);
      const cs = font.characterSet;
      const hasRupee = cs && (
        (typeof cs.has === 'function' && cs.has(0x20b9)) ||
        (typeof cs.includes === 'function' && cs.includes(0x20b9))
      );
      return hasRupee ? '₹' : 'Rs. ';
    } catch {
      return 'Rs. ';
    }
  }
  return 'Rs. ';
}

function currentRupeeSign() {
  if (!rupeeSignChecked) {
    rupeeSign = getCurrencySign();
    rupeeSignChecked = true;
  }
  return rupeeSign;
}

export function formatINR(n) {
  const sign = currentRupeeSign();
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  const str = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${num < 0 ? '-' : ''}${sign}${str}`;
}

function isInRange(dateStr, range, month, year) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  if (range === 'all') return true;
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}

async function readAll(ranges) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [pocketMoney, income, expenses, budgets, goals, savingsTx, recurring, settings] = await Promise.all([
    readSheet('PocketMoney'),
    readSheet('Income'),
    readSheet('Expenses'),
    readSheet('Budgets'),
    readSheet('SavingsGoals'),
    readSheet('SavingsTransactions'),
    readSheet('RecurringExpenses'),
    readSheet('UserSettings'),
  ]);

  const totalSavings = calculateSavingsNet(savingsTx);

  const pm = pocketMoney.find((p) => parseInt(p.Month) === month && parseInt(p.Year) === year);
  const pocketMoneyAmount = pm ? parseFloat(pm.PocketMoney) || 0 : 0;

  const incInRange = income.filter((i) => isInRange(i.Date, ranges, month, year));
  const expInRange = expenses.filter((e) => isInRange(e.Date, ranges, month, year));
  const additionalIncome = incInRange.reduce((s, i) => s + (parseFloat(i.Amount) || 0), 0);
  const totalSpent = expInRange.reduce((s, e) => s + (parseFloat(e.Amount) || 0), 0);
  const totalAvailable = pocketMoneyAmount + additionalIncome;
  const remaining = totalAvailable - totalSpent - Math.max(totalSavings, 0);

  const categorySpending = {};
  expInRange.forEach((e) => {
    const cat = e.Category;
    if (cat) categorySpending[cat] = (categorySpending[cat] || 0) + (parseFloat(e.Amount) || 0);
  });
  const sortedCategories = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0].name : null;

  const budgetsCurrent = budgets
    .filter((b) => parseInt(b.Month) === month && parseInt(b.Year) === year)
    .map((b) => {
      const spent = categorySpending[b.Category] || 0;
      const limit = parseFloat(b.BudgetLimit) || 0;
      const remainingAmt = limit - spent;
      const pct = limit > 0 ? (spent / limit) * 100 : 0;
      return { Category: b.Category, Limit: limit, Spent: spent, Remaining: remainingAmt, Usage: pct };
    });

  const goalRows = goals.map((g) => {
    const saved = calculateSavingsNet(savingsTx, g.ID);
    const target = parseFloat(g.TargetAmount) || 0;
    const remainingAmt = Math.max(target - saved, 0);
    return {
      Goal: g.GoalName,
      Target: target,
      Saved: saved,
      Remaining: remainingAmt,
      Progress: target > 0 ? (saved / target) * 100 : 0,
      Icon: g.Icon || '🎯',
    };
  });

  const sortedTx = [...savingsTx].sort((a, b) =>
    (b.CreatedAt || '').localeCompare(a.CreatedAt || '') || (b.Date || '').localeCompare(a.Date || '')
  );

  const settingsRow = settings[0] || null;
  const periodLabel = ranges === 'all' ? 'All Time' : now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return {
    ranges,
    pocketMoney: pocketMoneyAmount,
    additionalIncome,
    totalAvailable,
    totalSpent,
    remaining,
    totalSavings,
    expenses: expInRange,
    income: incInRange,
    budgets: budgetsCurrent,
    categorySpending: sortedCategories,
    topCategory,
    savingsTransactions: sortedTx,
    goals: goalRows,
    recurring,
    settings: settingsRow,
    periodLabel,
    generatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  };
}

function createDoc() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: MARGIN_L, right: MARGIN_R },
    bufferPages: true,
    info: {
      Title: 'Pocket Money Tracker — Financial Report',
      Author: 'Pocket Money Tracker',
      Producer: 'Pocket Money Tracker',
    },
  });

  const fonts = resolveFonts();
  if (fonts) {
    doc.registerFont('Body', fonts.body);
    doc.registerFont('BodyBold', fonts.bold);
  } else {
    doc.registerFont('Body', 'Helvetica');
    doc.registerFont('BodyBold', 'Helvetica-Bold');
  }
  return doc;
}

let y = HEADER_TOP;
let docRef = null;

function footer() {
  const total = docRef.bufferedPageRange().count;
  for (let i = 0; i < total; i++) {
    docRef.switchToPage(i);
    docRef.font('Body').fontSize(7.5).fillColor(GRAY);
    docRef.text('Pocket Money Tracker — Financial Report', MARGIN_L, PAGE_HEIGHT - 50, { width: 300 });
    docRef.text(`Page ${i + 1} of ${total}`, MARGIN_R, PAGE_HEIGHT - 50, { width: CONTENT_W - 300, align: 'right' });
  }
}

function ensureSpace(needed) {
  if (y + needed > PAGE_HEIGHT - BOTTOM_PAD) {
    docRef.addPage();
    y = HEADER_TOP;
  }
}

function sectionTitle(title) {
  ensureSpace(26);
  docRef.font('BodyBold').fontSize(12).fillColor(PURPLE);
  docRef.text(title.toUpperCase(), MARGIN_L, y);
  y += 17;
  docRef.moveTo(MARGIN_L, y - 4).lineTo(MARGIN_L + CONTENT_W, y - 4).strokeColor(LINE_COLOR).lineWidth(0.75).stroke();
}

function drawSummaryBlock(summary) {
  ensureSpace(190);
  const title = 'Financial Summary';
  docRef.font('BodyBold').fontSize(12).fillColor(PURPLE).text(title.toUpperCase(), MARGIN_L, y);
  y += 17;
  const gap = 12;
  const cardW = (CONTENT_W - gap) / 2;
  const cardH = 48;
  const items = [
    ['Pocket Money', summary.pocketMoney],
    ['Additional Income', summary.additionalIncome],
    ['Total Available', summary.totalAvailable],
    ['Total Spent', summary.totalSpent],
    ['Remaining', summary.remaining],
    ['Total Savings', summary.totalSavings],
  ];
  items.forEach((item, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = MARGIN_L + col * (cardW + gap);
    const yy = y + row * (cardH + gap);
    docRef.roundedRect(x, yy, cardW, cardH, 10).fill(HEADER_FILL);
    docRef.font('Body').fontSize(8).fillColor(GRAY).text(item[0], x + 12, yy + 9, { width: cardW - 24 });
    docRef.font('BodyBold').fontSize(14).fillColor(item[0] === 'Remaining' && Number(item[1]) < 0 ? '#DC2626' : NAVY).text(formatINR(item[1]), x + 12, yy + 23, { width: cardW - 24 });
  });
  y += 3 * cardH + 2 * gap + 8;
}

function tableHeader(columns) {
  const x = MARGIN_L;
  docRef.rect(x, y, CONTENT_W, 20).fill(HEADER_FILL);
  let cx = x;
  columns.forEach((c) => {
    docRef.font('BodyBold').fontSize(8.5).fillColor(VIOLET_DARK);
    docRef.text(String(c.title).toUpperCase(), cx + 6, y + 6, { width: c.width - 12, align: c.align || 'left' });
    cx += c.width;
  });
  docRef.moveTo(x, y + 20).lineTo(x + CONTENT_W, y + 20).strokeColor(VIOLET_DARK).lineWidth(0.75).stroke();
  y += 20;
}

function measureRow(columns, row) {
  const lineH = 13;
  let maxLines = 1;
  columns.forEach((c) => {
    const text = row[c.key] === undefined || row[c.key] === null ? '' : String(row[c.key]);
    if (text) {
      const h = docRef.heightOfString(text, { width: c.width - 12 });
      const lines = Math.max(1, Math.ceil(h / lineH));
      maxLines = Math.max(maxLines, lines);
    }
  });
  return Math.max(22, maxLines * lineH + 9);
}

function drawTable(columns, rows, emptyText) {
  if (!rows || rows.length === 0) {
    ensureSpace(24);
    docRef.font('Body').fontSize(9).fillColor(GRAY).text(emptyText, MARGIN_L, y);
    y += 26;
    return;
  }
  ensureSpace(20);
  tableHeader(columns);
  rows.forEach((row, i) => {
    const rh = measureRow(columns, row);
    if (y + rh > PAGE_HEIGHT - BOTTOM_PAD) {
      docRef.addPage();
      y = HEADER_TOP;
      tableHeader(columns);
    }
    if (i % 2 === 1) docRef.rect(MARGIN_L, y, CONTENT_W, rh).fill(STRIPE_FILL);
    let cx = MARGIN_L;
    columns.forEach((c) => {
      const text = row[c.key] === undefined || row[c.key] === null ? '' : String(row[c.key]);
      docRef.font('Body').fontSize(9).fillColor(NAVY);
      docRef.text(text, cx + 6, y + 5, { width: c.width - 12, height: rh - 8, align: c.align || 'left', ellipsis: true });
      cx += c.width;
    });
    y += rh;
    docRef.moveTo(MARGIN_L, y).lineTo(MARGIN_L + CONTENT_W, y).strokeColor(LINE_COLOR).lineWidth(0.5).stroke();
  });
  y += 8;
}

function totalRow(label, value, width) {
  ensureSpace(22);
  docRef.font('BodyBold').fontSize(9).fillColor(NAVY);
  docRef.text(label, MARGIN_L, y, { width: CONTENT_W - width, align: 'right' });
  const x = MARGIN_L + (CONTENT_W - width);
  docRef.rect(x, y, width, 18).fill('#E9E4FA');
  docRef.fillColor(VIOLET_DARK).text(formatINR(value), x + 4, y + 4, { width: width - 8, align: 'right' });
  y += 24;
}

function drawExpenses(data) {
  sectionTitle('Expenses');
  const columns = [
    { title: 'Date', key: 'Date', width: 75 },
    { title: 'Expense', key: 'ExpenseName', width: 150 },
    { title: 'Category', key: 'Category', width: 110 },
    { title: 'Payment', key: 'PaymentMethod', width: 75 },
    { title: 'Amount', key: 'Amount', width: 95, align: 'right' },
  ];
  const sorted = [...data.expenses].sort((a, b) => (b.Date || '').localeCompare(a.Date || ''));
  const rows = sorted.map((e) => ({
    Date: e.Date || '',
    ExpenseName: e.ExpenseName || '',
    Category: e.Category || '',
    PaymentMethod: e.PaymentMethod || '',
    Amount: formatINR(e.Amount),
  }));
  drawTable(columns, rows, 'No expense records available.');
  if (sorted.length > 0) totalRow('Total Expenses:', data.totalSpent, 130);
}

function drawIncome(data) {
  sectionTitle('Income');
  const columns = [
    { title: 'Date', key: 'Date', width: 95 },
    { title: 'Source', key: 'Source', width: 275 },
    { title: 'Amount', key: 'Amount', width: 135, align: 'right' },
  ];
  const sorted = [...data.income].sort((a, b) => (b.Date || '').localeCompare(a.Date || ''));
  const rows = sorted.map((i) => ({
    Date: i.Date || '',
    Source: i.Source || '',
    Amount: formatINR(i.Amount),
  }));
  drawTable(columns, rows, 'No income records available.');
  if (sorted.length > 0) totalRow('Total Additional Income:', data.additionalIncome, 150);
}

function drawBudgets(data) {
  sectionTitle('Budget Status');
  const columns = [
    { title: 'Category', key: 'Category', width: 130 },
    { title: 'Budget Limit', key: 'Limit', width: 95, align: 'right' },
    { title: 'Spent', key: 'Spent', width: 95, align: 'right' },
    { title: 'Remaining', key: 'Remaining', width: 95, align: 'right' },
    { title: 'Usage %', key: 'Usage', width: 90, align: 'right' },
  ];
  const rows = data.budgets.map((b) => ({
    Category: b.Category,
    Limit: formatINR(b.Limit),
    Spent: formatINR(b.Spent),
    Remaining: formatINR(b.Remaining),
    Usage: `${Math.round(b.Usage)}%`,
  }));
  drawTable(columns, rows, 'No budgets set for this month.');
}

function drawSavings(data) {
  sectionTitle('Savings');
  ensureSpace(24);
  docRef.font('Body').fontSize(9).fillColor(GRAY).text('Total Savings', MARGIN_L, y);
  docRef.font('BodyBold').fontSize(14).fillColor('#0E9F6E').text(formatINR(data.totalSavings), MARGIN_L + 80, y - 2);
  y += 26;

  const columns = [
    { title: 'Date', key: 'Date', width: 75 },
    { title: 'Type', key: 'Type', width: 90 },
    { title: 'Amount', key: 'Amount', width: 95, align: 'right' },
    { title: 'Notes', key: 'Notes', width: 245 },
  ];
  const rows = data.savingsTransactions.slice(0, 50).map((t) => ({
    Date: t.Date || '',
    Type: t.Type === 'Deposit' ? 'Deposit' : 'Withdrawal',
    Amount: `${t.Type === 'Deposit' ? '+' : '-'}${formatINR(t.Amount)}`,
    Notes: t.Notes || (t.GoalID ? '(savings goal)' : ''),
  }));
  drawTable(columns, rows, data.savingsTransactions.length === 0 ? 'No savings transactions yet.' : 'Savings transactions available.');
}

function drawGoals(data) {
  const goals = data.goals || [];
  if (goals.length === 0) return;
  sectionTitle('Savings Goals');
  const columns = [
    { title: 'Goal', key: 'Goal', width: 130 },
    { title: 'Target', key: 'Target', width: 95, align: 'right' },
    { title: 'Saved', key: 'Saved', width: 95, align: 'right' },
    { title: 'Remaining', key: 'Remaining', width: 95, align: 'right' },
    { title: 'Progress %', key: 'Progress', width: 90, align: 'right' },
  ];
  const rows = goals.map((g) => ({
    Goal: `${g.Icon ? g.Icon + ' ' : ''}${g.Goal || ''}`,
    Target: formatINR(g.Target),
    Saved: formatINR(g.Saved),
    Remaining: formatINR(g.Remaining),
    Progress: `${Math.round(g.Progress)}%`,
  }));
  drawTable(columns, rows, 'No savings goals available.');
}

function drawCategorySummary(data) {
  sectionTitle('Category Spending Summary');
  const columns = [
    { title: 'Category', key: 'Category', width: 300 },
    { title: 'Amount', key: 'Amount', width: 205, align: 'right' },
  ];
  const rows = data.categorySpending.map((c) => ({ Category: c.name, Amount: formatINR(c.value) }));
  drawTable(columns, rows, 'No category spending available.');
  if (data.topCategory) {
    ensureSpace(22);
    docRef.font('Body').fontSize(9.5).fillColor(NAVY);
    docRef.text(`Top Spending Category: `, MARGIN_L, y);
    docRef.font('BodyBold').fillColor(PURPLE).text(data.topCategory, MARGIN_L + 118, y);
    y += 20;
  } else {
    ensureSpace(22);
    docRef.font('Body').fontSize(9.5).fillColor(GRAY).text('No spending yet this period.', MARGIN_L, y);
    y += 20;
  }
}

export async function generateFinancialPdf({ range = 'month' } = {}) {
  const data = await readAll(range === 'all' ? 'all' : 'month');
  const doc = createDoc();
  docRef = doc;
  y = HEADER_TOP;

  doc.font('BodyBold').fontSize(20).fillColor(NAVY).text('Pocket Money Tracker', MARGIN_L, HEADER_TOP);
  doc.font('BodyBold').fontSize(13).fillColor(PURPLE).text('Financial Report', MARGIN_L, HEADER_TOP + 26);
  y = HEADER_TOP + 46;
  doc.font('Body').fontSize(8.5).fillColor(GRAY);
  doc.text(`Period: ${data.periodLabel}`, MARGIN_L, y);
  doc.text(`Generated: ${data.generatedAt}`, MARGIN_R, y, { width: CONTENT_W - 100, align: 'right' });
  y += 16;
  doc.moveTo(MARGIN_L, y).lineTo(MARGIN_L + CONTENT_W, y).strokeColor(PURPLE).lineWidth(1.25).stroke();
  y += 8;

  drawSummaryBlock(data);
  drawExpenses(data);
  drawIncome(data);
  drawBudgets(data);
  drawSavings(data);
  drawGoals(data);
  drawCategorySummary(data);

  footer();

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}