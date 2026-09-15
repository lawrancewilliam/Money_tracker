export function formatINR(value) {
  const num = Number(value) || 0;
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatCurrency(value, currency = 'INR') {
  const num = Number(value) || 0;
  if (currency === 'INR') return formatINR(num);
  return num.toLocaleString(undefined, { style: 'currency', currency });
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function calculateBudgetStatus(spent, limit) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  if (percentage >= 100) return 'Exceeded';
  if (percentage >= 90) return 'Almost Exhausted';
  if (percentage >= 75) return 'Approaching Limit';
  return 'Safe';
}
