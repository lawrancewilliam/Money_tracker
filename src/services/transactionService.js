import api from './api.js';

export const transactionService = {
  getAll: () => api.get('/transactions').then(d => d.transactions),
};
