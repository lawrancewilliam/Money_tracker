export function validateExpense(data) {
  const errors = [];
  if (!data.ExpenseName || typeof data.ExpenseName !== 'string' || data.ExpenseName.trim().length === 0) {
    errors.push('Expense name is required');
  }
  const amount = parseFloat(data.Amount);
  if (isNaN(amount) || amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.Date) errors.push('Date is required');
  if (!data.Category) errors.push('Category is required');
  return errors;
}

export function validateIncome(data) {
  const errors = [];
  const amount = parseFloat(data.Amount);
  if (isNaN(amount) || amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.Date) errors.push('Date is required');
  return errors;
}

export function validateBudget(data) {
  const errors = [];
  const limit = parseFloat(data.BudgetLimit);
  if (isNaN(limit) || limit < 0) errors.push('Budget limit must be >= 0');
  if (!data.Category) errors.push('Category is required');
  return errors;
}

export function validateSavingsGoal(data) {
  const errors = [];
  if (!data.GoalName || data.GoalName.trim().length === 0) errors.push('Goal name is required');
  const target = parseFloat(data.TargetAmount);
  if (isNaN(target) || target <= 0) errors.push('Target amount must be greater than 0');
  return errors;
}

export function validateSavingsTransaction(data) {
  const errors = [];
  const amount = parseFloat(data.Amount);
  if (isNaN(amount) || amount <= 0) errors.push('Amount must be greater than 0');
  if (!['Deposit', 'Withdrawal'].includes(data.Type)) errors.push('Type must be Deposit or Withdrawal');
  return errors;
}

export function validateRecurring(data) {
  const errors = [];
  if (!data.ExpenseName || data.ExpenseName.trim().length === 0) errors.push('Expense name is required');
  const amount = parseFloat(data.Amount);
  if (isNaN(amount) || amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.Frequency) errors.push('Frequency is required');
  if (!['Weekly', 'Monthly', 'Quarterly', 'Yearly'].includes(data.Frequency)) errors.push('Invalid frequency');
  return errors;
}

export function parsePositiveAmount(value) {
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

export function sanitizeString(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\n\r]/g, '').trim().slice(0, maxLength);
}

export function isValidDate(value) {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}
