import express from 'express';
import { config } from 'dotenv';

config();

import initializeHandler from './initialize.js';
import dashboardHandler from './dashboard.js';
import expensesHandler from './expenses.js';
import incomeHandler from './income.js';
import transactionsHandler from './transactions.js';
import budgetsHandler from './budgets.js';
import savingsHandler from './savings.js';
import recurringHandler from './recurring.js';
import notificationsHandler from './notifications.js';
import settingsHandler from './settings.js';
import analyticsHandler from './analytics.js';
import aiInsightsHandler from './ai-insights.js';
import backupHandler from './backup.js';
import exportHandler from './export.js';
import resetHandler from './reset.js';

const app = express();
app.use(express.json());

function wrap(handler) {
  return (req, res) => {
    const framedReq = {
      ...req,
      query: req.query || {},
    };
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

app.use('/api', (req, res) => res.status(404).json({ error: `Not found: ${req.url}` }));

export default app;
