// ─────────────────────────────────────────────────────────────
// CENTRALIZED AXIOS INSTANCE WITH JWT INTERCEPTOR
// ─────────────────────────────────────────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let csrfTokenCache = '';

//Fetch CSRF Token from Backend
export const fetchCsrfToken = async () => {
  try {
    const res = await api.get('/auth/csrf-token');
    if (res.data?.csrfToken) {
      csrfTokenCache = res.data.csrfToken;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', err.message)
  }
}

//Initialize CSRF Token on startup
fetchCsrfToken();

// ── REQUEST INTERCEPTOR: Automatically attach JWT Token ──────
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      if (!csrfTokenCache) {
        await fetchCsrfToken();
      }

      if(csrfTokenCache) {
        config.headers['x-csrf-token'] = csrfTokenCache;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── RESPONSE INTERCEPTOR: Handle global errors (e.g. 401 Unauthorized) ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid -> clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;