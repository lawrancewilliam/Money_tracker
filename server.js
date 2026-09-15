import { createRequire } from 'module';
import path from 'path';
import express from 'express';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

config();

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import initializeHandler from './api/initialize.js';
import dashboardHandler from './api/dashboard.js';
import expensesHandler from './api/expenses.js';
import incomeHandler from './api/income.js';
import transactionsHandler from './api/transactions.js';
import budgetsHandler from './api/budgets.js';
import savingsHandler from './api/savings.js';
import recurringHandler from './api/recurring.js';
import notificationsHandler from './api/notifications.js';
import settingsHandler from './api/settings.js';
import analyticsHandler from './api/analytics.js';
import aiInsightsHandler from './api/ai-insights.js';
import backupHandler from './api/backup.js';
import exportHandler from './api/export.js';
import resetHandler from './api/reset.js';

const app = express();
app.use(express.json());

function wrap(handler) {
  return (req, res) => {
    const framedReq = { ...req, query: req.query || {} };
    return Promise.resolve(handler(framedReq, res));
  };
}

app.get('/api/initialize', wrap(initializeHandler));
app.get('/api/dashboard', wrap(dashboardHandler));
app.get('/api/expenses', wrap(expensesHandler));
app.post('/api/expenses', wrap(expensesHandler));
app.put('/api/expenses', wrap(expensesHandler));
app.delete('/api/expenses', wrap(expensesHandler));
app.get('/api/income', wrap(incomeHandler));
app.post('/api/income', wrap(incomeHandler));
app.put('/api/income', wrap(incomeHandler));
app.delete('/api/income', wrap(incomeHandler));
app.get('/api/transactions', wrap(transactionsHandler));
app.get('/api/budgets', wrap(budgetsHandler));
app.post('/api/budgets', wrap(budgetsHandler));
app.put('/api/budgets', wrap(budgetsHandler));
app.delete('/api/budgets', wrap(budgetsHandler));
app.get('/api/savings', wrap(savingsHandler));
app.post('/api/savings', wrap(savingsHandler));
app.put('/api/savings', wrap(savingsHandler));
app.delete('/api/savings', wrap(savingsHandler));
app.get('/api/recurring', wrap(recurringHandler));
app.post('/api/recurring', wrap(recurringHandler));
app.put('/api/recurring', wrap(recurringHandler));
app.delete('/api/recurring', wrap(recurringHandler));
app.get('/api/notifications', wrap(notificationsHandler));
app.post('/api/notifications', wrap(notificationsHandler));
app.put('/api/notifications', wrap(notificationsHandler));
app.delete('/api/notifications', wrap(notificationsHandler));
app.get('/api/settings', wrap(settingsHandler));
app.put('/api/settings', wrap(settingsHandler));
app.get('/api/analytics', wrap(analyticsHandler));
app.post('/api/analytics', wrap(analyticsHandler));
app.post('/api/ai-insights', wrap(aiInsightsHandler));
app.post('/api/backup', wrap(backupHandler));
app.get('/api/export', wrap(exportHandler));
app.post('/api/reset', wrap(resetHandler));

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/assets/')) {
    return next();
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) res.status(500).send('Not built yet. Run: npm run build');
  });
});
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.url}` }));

const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`Pocket Money running at http://localhost:${PORT}`);
  if (process.env.OPEN_BROWSER !== '0') {
    setTimeout(() => {
      require('child_process').exec(
        `start "" "http://localhost:${PORT}"`,
        () => {}
      );
    }, 700);
  }
});