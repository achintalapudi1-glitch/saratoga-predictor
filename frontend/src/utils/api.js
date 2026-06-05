import axios from 'axios';

/**
 * API base URL resolution:
 *  - Development:  proxied to localhost:3001 via CRA proxy → '/api'
 *  - Production:   REACT_APP_API_URL set by Render (just the host, no protocol)
 *                  e.g. "saratoga-handicapper-api.onrender.com"
 */
const rawHost = process.env.REACT_APP_API_URL || '';

const baseURL = rawHost
  ? `https://${rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Log base URL in development only
if (process.env.NODE_ENV === 'development') {
  console.log('[API] baseURL:', baseURL);
}

export const fetchRaces      = ()           => api.get('/races').then((r) => r.data);
export const fetchRace       = (num, cond)  => api.get(`/races/${num}?condition=${cond || 'fast'}`).then((r) => r.data);
export const fetchWeather    = ()           => api.get('/weather').then((r) => r.data);
export const calcBet         = (payload)    => api.post('/calculator/bet', payload).then((r) => r.data);
export const parseBetString  = (betString)  => api.post('/calculator/parse', { betString }).then((r) => r.data);
export const calcSlate       = (bets)       => api.post('/calculator/slate', { bets }).then((r) => r.data);
export const healthCheck     = ()           => api.get('/health').then((r) => r.data);

export default api;
