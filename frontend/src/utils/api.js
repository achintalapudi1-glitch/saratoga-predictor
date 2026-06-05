import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchRaces      = ()           => api.get('/races').then((r) => r.data);
export const fetchRace       = (num, cond)  => api.get(`/races/${num}?condition=${cond || 'fast'}`).then((r) => r.data);
export const fetchWeather    = ()           => api.get('/weather').then((r) => r.data);
export const calcBet         = (payload)    => api.post('/calculator/bet', payload).then((r) => r.data);
export const parseBetString  = (betString)  => api.post('/calculator/parse', { betString }).then((r) => r.data);
export const calcSlate       = (bets)       => api.post('/calculator/slate', { bets }).then((r) => r.data);
export const healthCheck     = ()           => api.get('/health').then((r) => r.data);

export default api;
