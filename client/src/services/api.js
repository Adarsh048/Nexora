const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('nexora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// Auth API
export const authApi = {
  getMe: () => request('/auth/me'),
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  demoLogin: () =>
    request('/auth/demo', {
      method: 'POST',
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
  updateProfile: (updates) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  clearData: () =>
    request('/auth/clear-data', {
      method: 'POST',
    }),
};

// Applications API
export const applicationApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/applications?${qs}`);
  },
  getKanban: () => request('/applications/kanban'),
  getById: (id) => request(`/applications/${id}`),
  create: (payload) =>
    request('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, updates) =>
    request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  updateStatus: (id, status, notes) =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  delete: (id) =>
    request(`/applications/${id}`, {
      method: 'DELETE',
    }),
};

// Timeline API
export const timelineApi = {
  getFeed: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/timeline/feed?${qs}`);
  },
  getByApplication: (appId) => request(`/timeline/application/${appId}`),
  addEvent: (appId, eventData) =>
    request(`/timeline/application/${appId}`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
};

// Gmail API
export const gmailApi = {
  getStatus: () => request('/gmail/status'),
  getAuthUrl: () => request('/gmail/auth-url'),
  syncNow: () =>
    request('/gmail/sync', {
      method: 'POST',
    }),
  connectDemo: (emailAddress) =>
    request('/gmail/demo-connect', {
      method: 'POST',
      body: JSON.stringify({ emailAddress }),
    }),
  disconnect: () =>
    request('/gmail/disconnect', {
      method: 'POST',
    }),
};

// Inbox Intelligence API
export const inboxApi = {
  getEmails: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/inbox?${qs}`);
  },
  simulate: (payload = {}) =>
    request('/inbox/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  clearAll: () =>
    request('/inbox/clear', {
      method: 'POST',
    }),
  approve: (emailId, payload = {}) =>
    request(`/inbox/approve/${emailId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  dismiss: (emailId) =>
    request(`/inbox/dismiss/${emailId}`, {
      method: 'POST',
    }),
  link: (emailId, applicationId) =>
    request(`/inbox/link/${emailId}`, {
      method: 'POST',
      body: JSON.stringify({ applicationId }),
    }),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => request('/analytics/dashboard'),
  getInsights: (timeframe = 'all') => request(`/analytics/insights?timeframe=${timeframe}`),
};

// Calendar API
export const calendarApi = {
  getEvents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/calendar?${qs}`);
  },
  create: (eventData) =>
    request('/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
  update: (id, updates) =>
    request(`/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id) =>
    request(`/calendar/${id}`, {
      method: 'DELETE',
    }),
};

// Companies API
export const companyApi = {
  getAll: (search = '') => request(`/companies?search=${encodeURIComponent(search)}`),
  getById: (id) => request(`/companies/${id}`),
  create: (data) =>
    request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, updates) =>
    request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id) =>
    request(`/companies/${id}`, {
      method: 'DELETE',
    }),
};

// Achievements API
export const achievementApi = {
  getAll: () => request('/achievements'),
};

// Notifications API
export const notificationApi = {
  getAll: () => request('/notifications'),
  markAsRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllRead: () =>
    request('/notifications/read-all', {
      method: 'PATCH',
    }),
  delete: (id) =>
    request(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

