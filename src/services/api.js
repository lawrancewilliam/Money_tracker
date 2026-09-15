import { setStorageStatus } from '../utils/storageStatus.js';

const BASE = '/api';

const MOCK_DATA = {
  '/analytics': {
    currentMonth: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    summary: {
      income: 5500,
      expenses: 3250,
      pocketMoney: 5000,
      additionalIncome: 500,
      savings: 500,
      remaining: 1750,
    },
    categorySpending: [
      { name: 'Food', value: 1100 },
      { name: 'Travel', value: 500 },
      { name: 'Entertainment', value: 900 },
      { name: 'Shopping', value: 450 },
      { name: 'Others', value: 300 },
    ],
    dailySpending: [
      { day: 1, value: 180 }, { day: 2, value: 120 }, { day: 3, value: 260 },
      { day: 4, value: 90 }, { day: 5, value: 300 }, { day: 6, value: 150 },
      { day: 7, value: 220 }, { day: 8, value: 180 }, { day: 9, value: 140 },
      { day: 10, value: 350 }, { day: 11, value: 120 }, { day: 12, value: 240 },
      { day: 13, value: 160 }, { day: 14, value: 280 }, { day: 15, value: 130 },
    ],
    monthlyTrend: [
      { month: 8, income: 5000, expenses: 2950 },
      { month: 9, income: 5500, expenses: 3250 },
    ],
    savingsGoals: [
      { name: 'Headphones', target: 3000, saved: 1800 },
      { name: 'Emergency Fund', target: 10000, saved: 4500 },
    ],
    savingsRate: 9,
    dailyAverage: 217,
    topCategory: 'Food',
    largestExpense: { ExpenseName: 'Shopping', Amount: 450 },
    projectedMonthEnd: 6510,
    projectedBalance: -1010,
    monthOverMonthChange: 10.2,
  },
  '/dashboard': {
    summary: {
      pocketMoney: 5000,
      additionalIncome: 500,
      totalAvailable: 5500,
      totalSpent: 3250,
      remaining: 1750,
      savings: 500,
    },
    monthlySpending: 3250,
    todaySpending: 200,
    weekSpending: 850,
    topCategories: [
      { name: 'Food', value: 1100 },
      { name: 'Entertainment', value: 900 },
      { name: 'Travel', value: 500 },
      { name: 'Shopping', value: 450 },
      { name: 'Others', value: 300 }
    ],
    recentExpenses: [
      { ID: 'e1', Date: '2026-09-01', Time: '13:00', ExpenseName: 'Lunch', Category: 'Food', Amount: 120, PaymentMethod: 'UPI', Notes: 'Cafeteria' },
      { ID: 'e2', Date: '2026-09-01', Time: '09:00', ExpenseName: 'College Travel', Category: 'Travel', Amount: 80, PaymentMethod: 'Cash', Notes: 'Bus pass' },
      { ID: 'e3', Date: '2026-08-31', Time: '18:30', ExpenseName: 'Movie Ticket', Category: 'Entertainment', Amount: 300, PaymentMethod: 'UPI', Notes: 'PVR' }
    ],
    budgetStatus: [
      { ID: 'b1', Category: 'Food', BudgetLimit: 2000, spent: 1100, remaining: 900, percentage: 55, status: 'On Track' },
      { ID: 'b2', Category: 'Travel', BudgetLimit: 1000, spent: 500, remaining: 500, percentage: 50, status: 'On Track' },
      { ID: 'b3', Category: 'Entertainment', BudgetLimit: 1500, spent: 900, remaining: 600, percentage: 60, status: 'Warning' }
    ],
    savingsGoals: [
      { ID: 'g1', GoalName: 'Headphones', TargetAmount: 3000, saved: 1800, Icon: '🎧', percentage: 60, remaining: 1200 },
      { ID: 'g2', GoalName: 'Emergency Fund', TargetAmount: 10000, saved: 4500, Icon: '🛡️', percentage: 45, remaining: 5500 }
    ],
    upcomingRecurring: [
      { ID: 'r1', ExpenseName: 'Spotify', Amount: 119, Category: 'Entertainment', NextPaymentDate: '2026-09-05' },
      { ID: 'r2', ExpenseName: 'Mobile Recharge', Amount: 299, Category: 'Recharge / Subscription', NextPaymentDate: '2026-09-12' }
    ],
    smartInsight: 'Food is your highest spending category at ₹1,100 this month. You are on track with your budget.',
    unreadNotifications: 1,
    categories: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Recharge / Subscription', 'Education', 'Health', 'Friends / Outing', 'Bills', 'Others'],
    settings: { Name: 'Student', Currency: '₹', BudgetCycle: 'Monthly' }
  },
  '/expenses': {
    expenses: [
      { ID: 'e1', Date: '2026-09-01', Time: '13:00', ExpenseName: 'Lunch', Category: 'Food', Amount: 120, PaymentMethod: 'UPI', Notes: 'Cafeteria' },
      { ID: 'e2', Date: '2026-09-01', Time: '09:00', ExpenseName: 'College Travel', Category: 'Travel', Amount: 80, PaymentMethod: 'Cash', Notes: 'Bus pass' },
      { ID: 'e3', Date: '2026-08-31', Time: '18:30', ExpenseName: 'Movie Ticket', Category: 'Entertainment', Amount: 300, PaymentMethod: 'UPI', Notes: 'PVR' }
    ]
  },
  '/income': {
    pocketMoney: { Amount: 5000, Month: 9, Year: 2026 },
    income: [
      { ID: 'i1', Date: '2026-08-30', Source: 'Freelance Work', Amount: 500, Notes: 'Logo design' }
    ]
  },
  '/transactions': {
    transactions: [
      { ID: 'e1', Date: '2026-09-01', Name: 'Lunch', Category: 'Food', Amount: 120, type: 'expense' },
      { ID: 'e2', Date: '2026-09-01', Name: 'College Travel', Category: 'Travel', Amount: 80, type: 'expense' },
      { ID: 'i1', Date: '2026-08-30', Name: 'Freelance Work', Category: 'Income', Amount: 500, type: 'income' }
    ]
  },
  '/budgets': {
    budgets: [
      { ID: 'b1', Category: 'Food', BudgetLimit: 2000, spent: 1100 },
      { ID: 'b2', Category: 'Travel', BudgetLimit: 1000, spent: 500 },
      { ID: 'b3', Category: 'Entertainment', BudgetLimit: 1500, spent: 900 }
    ]
  },
  '/savings': {
    goals: [
      { ID: 'g1', GoalName: 'Headphones', TargetAmount: 3000, saved: 1800, Icon: '🎧', Status: 'In Progress' },
      { ID: 'g2', GoalName: 'Emergency Fund', TargetAmount: 10000, saved: 4500, Icon: '🛡️', Status: 'In Progress' }
    ],
    transactions: [
      { ID: 'st1', GoalID: 'g1', Amount: 500, Type: 'Deposit', Date: '2026-08-25' }
    ]
  },
  '/recurring': {
    recurring: [
      { ID: 'r1', ExpenseName: 'Spotify', Amount: 119, Category: 'Entertainment', Frequency: 'Monthly', Status: 'Active' },
      { ID: 'r2', ExpenseName: 'Mobile Recharge', Amount: 299, Category: 'Recharge / Subscription', Frequency: 'Monthly', Status: 'Active' }
    ]
  },
  '/notifications': {
    notifications: [
      { ID: 'n1', Date: '2026-09-01', Type: 'info', Message: 'Welcome to Pocket Money Tracker!', ReadStatus: 'Unread' }
    ]
  },
  '/settings': {
    settings: { Name: 'Student', Currency: '₹', BudgetCycle: 'Monthly', Theme: 'dark' },
    status: { connected: false, message: 'Running in demo mode' }
  },
  '/ai-insights': {
    insights: [
      { type: 'tip', title: 'Great Food Budgeting', description: 'Your spending on Food is within target this month.' },
      { type: 'warning', title: 'Entertainment Alert', description: 'You have spent 60% of your entertainment budget.' }
    ]
  },
  '/initialize': { connected: false, message: 'Demo Mode' }
};

function getMockResponse(url, method, body) {
  const path = url.split('?')[0];
  const data = MOCK_DATA[path] || {};
  if (method === 'POST' || method === 'PUT') {
    if (path === '/expenses') return { expense: { ID: `e_${Date.now()}`, ...body } };
    if (path === '/income') return { income: { ID: `i_${Date.now()}`, ...body } };
    if (path === '/budgets') return { budget: { ID: `b_${Date.now()}`, ...body } };
    if (path === '/savings') return { goal: { ID: `g_${Date.now()}`, ...body } };
    if (path === '/recurring') return { recurring: { ID: `r_${Date.now()}`, ...body } };
    if (path === '/notifications') return { notification: { ID: `n_${Date.now()}`, ...body } };
  }
  return data;
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

async function request(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${url}`, opts);
  } catch (err) {
    if (DEMO_MODE) {
      console.warn(`[API Fallback] ${url} request failed (${err.message}). Using fallback data.`);
      setStorageStatus('Connected');
      return getMockResponse(url, method, body);
    }
    setStorageStatus('Error');
    throw new Error(`Network error connecting to server. ${err.message}`);
  }

  if (res.ok) {
    setStorageStatus('Connected');
    return await res.json();
  }

  if (DEMO_MODE) {
    console.warn(`[API Fallback] ${url} returned ${res.status}. Using fallback data.`);
    setStorageStatus('Connected');
    return getMockResponse(url, method, body);
  }

  setStorageStatus('Error');
  let errorMsg = `Request failed (${res.status})`;
  try {
    const errBody = await res.json();
    errorMsg = errBody.error || errorMsg;
  } catch {}
  throw new Error(errorMsg);
}

const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
  // Export endpoint returns raw content
  async export(url) {
    try {
      const res = await fetch(`${BASE}${url}`);
      if (!res.ok) throw new Error('Export failed');
      setStorageStatus('Connected');
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('json')) return { data: await res.json(), type: 'json' };
      return { data: await res.text(), type: 'csv' };
    } catch {
      setStorageStatus('Error');
      return { data: 'Date,Category,Amount\n2026-09-01,Food,120', type: 'csv' };
    }
  },
  // PDF export returns a binary blob with server-provided filename
  async exportPdf(url) {
    const res = await fetch(`${BASE}${url}`);
    if (!res.ok) {
      let msg = `Export failed (${res.status})`;
      try {
        const body = await res.json();
        if (body && body.error) msg = body.error;
      } catch {}
      setStorageStatus('Error');
      throw new Error(msg);
    }
    setStorageStatus('Connected');
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const m = cd.match(/filename="([^"]+)"/) || cd.match(/filename=([^;]+)/);
    const filename = m ? m[1] : `Pocket_Money_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    return { blob, filename };
  },
};

export default api;
