import api from './api.js';

export const analyticsService = {
  get: (params = '') => api.get(`/analytics${params}`),
  getAiInsights: () => api.post('/ai-insights', {}),
};

export const recurringService = {
  getAll: () => api.get('/recurring').then(d => d.recurring),
  create: (data) => api.post('/recurring', data).then(d => d.recurring),
  update: (id, data) => api.put(`/recurring?id=${id}`, data).then(d => d.recurring),
  remove: (id) => api.del(`/recurring?id=${id}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications').then(d => d.notifications),
  generate: () => api.post('/notifications', { action: 'generate' }),
  markRead: (id) => api.put(`/notifications?id=${id}`, { ReadStatus: 'Read' }).then(d => d.notification),
  markAllRead: () => api.put('/notifications?id=none', { action: 'markAllRead' }),
  remove: (id) => api.del(`/notifications?id=${id}`),
  clearAll: () => api.del('/notifications?id=all'),
};

export const settingsService = {
  get: () => api.get('/settings').then(d => ({ ...d.settings, status: d.status, projectUrl: d.projectUrl })),
  update: (data) => api.put('/settings', data).then(d => ({ ...d.settings, status: d.status, projectUrl: d.projectUrl })),
};

export const initializeService = {
  run: () => api.get('/initialize'),
};

export const backupService = {
  create: () => api.post('/backup'),
  export: (dataset = 'combined', format = 'json') => api.export(`/export?dataset=${dataset}&format=${format}`),
};
