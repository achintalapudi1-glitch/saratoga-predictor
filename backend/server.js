require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const racesRouter = require('./routes/races');
const weatherRouter = require('./routes/weather');
const calculatorRouter = require('./routes/calculator');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60_000, max: 100 });
app.use(limiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/races', racesRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/calculator', calculatorRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', track: 'Saratoga Race Course', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🏇  Saratoga Handicapper API running on http://localhost:${PORT}`);
});

module.exports = app;
