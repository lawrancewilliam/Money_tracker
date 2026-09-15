import { readSheet } from './lib/sheetsService.js';
import { getGoogleAuth } from './lib/googleAuth.js';
import { generateFinancialPdf } from './lib/pdfService.js';
import { mapError, internalError } from './lib/responses.js';

export default async function handler(req, res) {
  try {
    getGoogleAuth();

    if (req.method !== 'GET') return mapError(res, 405, 'Method not allowed');

    const dataset = req.query.dataset || 'combined';
    const format = req.query.format || 'json';

    if (format === 'pdf') {
      const range = req.query.range === 'all' ? 'all' : 'month';
      const buffer = await generateFinancialPdf({ range });
      const pad = (n) => String(n).padStart(2, '0');
      const d = new Date();
      const filename = `Pocket_Money_Report_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    const combined = {
      pocketMoney: await readSheet('PocketMoney'),
      income: await readSheet('Income'),
      expenses: await readSheet('Expenses'),
      categories: await readSheet('Categories'),
      budgets: await readSheet('Budgets'),
      savingsGoals: await readSheet('SavingsGoals'),
      savingsTransactions: await readSheet('SavingsTransactions'),
      recurringExpenses: await readSheet('RecurringExpenses'),
      notifications: await readSheet('Notifications'),
      userSettings: await readSheet('UserSettings'),
    };

    let data = combined;
    if (dataset !== 'combined') {
      data = combined[dataset] || [];
    }

    if (format === 'csv') {
      const items = Array.isArray(data) ? data : Object.values(data)[0] || [];
      let csv = '';
      if (items.length > 0) {
        const keys = Object.keys(items[0]);
        csv = keys.join(',') + '\n';
        items.forEach(row => {
          csv += keys.map(k => {
            const val = row[k] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(',') + '\n';
        });
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${dataset}.csv"`);
      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${dataset}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  } catch (e) {
    return internalError(res, e);
  }
}