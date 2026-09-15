import api from './api.js';

export const budgetService = {
  getAll: () => api.get('/budgets').then(d => d.budgets),
  create: (data) => api.post('/budgets', data).then(d => d.budget),
  update: (id, data) => api.put(`/budgets?id=${id}`, data).then(d => d.budget),
  remove: (id) => api.del(`/budgets?id=${id}`),
};
