export function getMonthYear(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export function isInMonth(dateStr, month, year) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}

export function calculateTotalIncome(pocketMoneyData, incomeData, month, year) {
  const pm = pocketMoneyData.find(p => parseInt(p.Month) === month && parseInt(p.Year) === year);
  const pocketMoneyAmount = pm ? parseFloat(pm.PocketMoney) || 0 : 0;
  const additionalIncome = incomeData
    .filter(i => isInMonth(i.Date, month, year))
    .reduce((sum, i) => sum + (parseFloat(i.Amount) || 0), 0);
  return { pocketMoney: pocketMoneyAmount, additionalIncome, totalIncome: pocketMoneyAmount + additionalIncome };
}

export function calculateTotalExpenses(expenseData, month, year) {
  return expenseData
    .filter(e => isInMonth(e.Date, month, year))
    .reduce((sum, e) => sum + (parseFloat(e.Amount) || 0), 0);
}

export function calculateCategorySpending(expenseData, month, year) {
  const spending = {};
  expenseData
    .filter(e => isInMonth(e.Date, month, year))
    .forEach(e => {
      const cat = e.Category;
      if (cat) spending[cat] = (spending[cat] || 0) + (parseFloat(e.Amount) || 0);
    });
  return spending;
}

export function calculateSavingsNet(savingsTransactions, goalId = null) {
  return savingsTransactions
    .filter(t => goalId ? t.GoalID === goalId : true)
    .reduce((sum, t) => {
      const amt = parseFloat(t.Amount) || 0;
      return t.Type === 'Withdrawal' ? sum - amt : sum + amt;
    }, 0);
}

export function calculateDailySpending(expenseData, month, year) {
  const daily = {};
  expenseData
    .filter(e => isInMonth(e.Date, month, year))
    .forEach(e => {
      const day = new Date(e.Date).getDate();
      daily[day] = (daily[day] || 0) + (parseFloat(e.Amount) || 0);
    });
  return daily;
}

export function calculateBudgetStatus(spent, limit) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  if (percentage >= 100) return 'Exceeded';
  if (percentage >= 90) return 'Almost Exhausted';
  if (percentage >= 75) return 'Approaching Limit';
  return 'Safe';
}

export function getStatusColor(status) {
  switch (status) {
    case 'Safe': return 'success';
    case 'Approaching Limit': return 'warning';
    case 'Almost Exhausted': return 'danger';
    case 'Exceeded': return 'danger';
    default: return 'success';
  }
}
