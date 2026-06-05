import axios from 'axios';

const rawHost = process.env.REACT_APP_API_URL || '';

const baseURL = rawHost
  ? `https://${rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 35000, // 35s — covers Render free-tier cold start (~30s)
  headers: { 'Content-Type': 'application/json' },
});

if (process.env.NODE_ENV === 'development') {
  console.log('[API] baseURL:', baseURL);
}

// Auto-retry once on timeout or network error
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    if (!config || config.__retried) return Promise.reject(err);
    const isRetryable = !err.response || err.code === 'ECONNABORTED' || err.response?.status >= 500;
    if (isRetryable) {
      config.__retried = true;
      await new Promise((r) => setTimeout(r, 3000)); // wait 3s then retry
      return api(config);
    }
    return Promise.reject(err);
  }
);

export const fetchRaces      = ()           => api.get('/races').then((r) => r.data);
export const fetchRace       = (num, cond)  => api.get(`/races/${num}?condition=${cond || 'fast'}`).then((r) => r.data);
export const fetchWeather    = ()           => api.get('/weather').then((r) => r.data);
export const calcBet         = (payload)    => api.post('/calculator/bet', payload).then((r) => r.data);
export const parseBetString  = (betString)  => api.post('/calculator/parse', { betString }).then((r) => r.data);
export const calcSlate       = (bets)       => api.post('/calculator/slate', { bets }).then((r) => r.data);
export const healthCheck     = ()           => api.get('/health').then((r) => r.data);

export default api;
