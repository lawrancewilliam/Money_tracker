import api from './api.js';

export const expenseService = {
  getAll: () => api.get('/expenses').then(d => d.expenses),
  create: (data) => api.post('/expenses', data).then(d => d.expense),
  update: (id, data) => api.put(`/expenses?id=${id}`, data).then(d => d.expense),
  remove: (id) => api.del(`/expenses?id=${id}`),
};
