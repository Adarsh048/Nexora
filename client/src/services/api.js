const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

// Ultra-fast in-memory cache & in-flight request deduplicator (0ms instant page loads)
const apiCache = new Map();
const inFlightRequests = new Map();
const CACHE_FRESH_MS = 8000;   // 8s: instant return without background revalidation
const CACHE_STALE_MS = 60000;  // 60s: return immediately and silently revalidate in background

export function invalidateCache(pattern = '') {
  if (!pattern) {
    apiCache.clear();
  } else {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) apiCache.delete(key);
    }
  }
}

async function executeNetworkFetch(endpoint, options = {}, token) {
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

async function request(endpoint, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const cacheKey = endpoint;
  const token = localStorage.getItem('nexora_token');

  // GET requests: Serve from cache with intelligent SWR
  if (isGet && !options.noCache) {
    const cached = apiCache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const age = now - cached.timestamp;
      // Fresh: instant 0ms return
      if (age < CACHE_FRESH_MS) {
        return cached.data;
      }
      // Stale but within 60s: return cached immediately, trigger background silent revalidation
      if (age < CACHE_STALE_MS) {
        if (!inFlightRequests.has(cacheKey)) {
          const revalidatePromise = executeNetworkFetch(endpoint, options, token)
            .then((freshData) => {
              apiCache.set(cacheKey, { data: freshData, timestamp: Date.now() });
              window.dispatchEvent(new CustomEvent(`nexora-cache-synced:${cacheKey}`, { detail: freshData }));
            })
            .catch(() => {})
            .finally(() => inFlightRequests.delete(cacheKey));
          inFlightRequests.set(cacheKey, revalidatePromise);
        }
        return cached.data;
      }
    }

    // Deduplicate in-flight identical GET requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }

    const fetchPromise = executeNetworkFetch(endpoint, options, token)
      .then((data) => {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });

    inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  // Mutations (POST, PUT, PATCH, DELETE)
  const result = await executeNetworkFetch(endpoint, options, token);

  // Targeted Cache Invalidation for sub-second UI synchronization
  if (endpoint.includes('/applications')) {
    invalidateCache('/applications');
    invalidateCache('/analytics');
    invalidateCache('/timeline');
  } else if (endpoint.includes('/notifications')) {
    invalidateCache('/notifications');
  } else if (endpoint.includes('/companies')) {
    invalidateCache('/companies');
  } else if (endpoint.includes('/calendar')) {
    invalidateCache('/calendar');
  } else {
    invalidateCache();
  }

  return result;
}

// Background workspace prefetcher for instant 0ms tab switching
export function prefetchWorkspaceData() {
  const token = localStorage.getItem('nexora_token');
  if (!token) return;
  request('/applications?limit=25').catch(() => {});
  request('/applications/kanban').catch(() => {});
  request('/analytics/dashboard').catch(() => {});
  request('/notifications').catch(() => {});
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

