import api from './api.js';

export const savingsService = {
  getAll: () => api.get('/savings').then(d => d),
  createGoal: (data) => api.post('/savings', data).then(d => d.goal),
  updateGoal: (id, data) => api.put(`/savings?id=${id}`, data).then(d => d.goal),
  deleteGoal: (id) => api.del(`/savings?id=${id}`),
  addTransaction: (data) => api.post('/savings', { ...data, action: 'transaction' }).then(d => ({ transaction: d.transaction, goalId: d.goalId })),
  addSavings: (data) => api.post('/savings', { ...data, action: 'transaction' }).then(d => ({ transaction: d.transaction, totalSavings: d.totalSavings })),
};
