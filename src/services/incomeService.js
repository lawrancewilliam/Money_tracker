import api from './api.js';

export const incomeService = {
  getAll: () => api.get('/income').then(d => d.income),
  create: (data) => api.post('/income', data).then(d => d.income),
  setPocketMoney: (data) => api.post('/income', { ...data, type: 'pocketMoney' }).then(d => d.pocketMoney),
  update: (id, data) => api.put(`/income?id=${id}`, data).then(d => d.income),
  remove: (id) => api.del(`/income?id=${id}`),
};
