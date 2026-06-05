# 🏇 Saratoga Race Course Handicapper

A full-stack AI-powered horse racing handicapper app for **Saratoga Race Course**, built with React + Node.js/Express.

![Saratoga Handicapper](https://img.shields.io/badge/Track-Saratoga-green) ![React](https://img.shields.io/badge/Frontend-React-blue) ![Node](https://img.shields.io/badge/Backend-Node.js-brightgreen)

---

## 🎯 Features

- **Weather & Track Conditions** — Live Saratoga forecast, dry vs. wet scenario rankings
- **Live Odds Panel** — Morning-line odds with sharp money alerts (20%+ move detection)
- **4-Model Analysis** — Side-by-side comparison table
  - **Model A** – Weighted Composite (Speed 25–35%, Pace 20–25%, Class, Form, Trainer, Jockey)
  - **Model B** – Speed Figure (Beyer/Brisnet, 3-race avg, vs. field)
  - **Model C** – Pace/Trip (projected fractions, BRIS pars, pace shape)
  - **Model D** – Value/Contrarian (overlays where win% > implied odds by 10%+)
- **Top 3 Picks** — Confidence scores `X% ± Y%` with factor breakdowns
- **Exotic Bet Recommendations** — Win/Place/Show, Exacta, Trifecta, Superfecta, Pick 4/5/6, Hi-5
- **Bet Calculator** — Enter any bet, get cost / payout / ROI% / hit probability

---

## 🏗️ Architecture

```
saratoga-handicapper/
├── backend/              # Node.js + Express API
│   ├── server.js
│   ├── routes/
│   │   ├── races.js      # Race data & horse entries
│   │   ├── weather.js    # Track conditions & forecast
│   │   └── calculator.js # Bet calculation engine
│   ├── utils/
│   │   ├── handicapper.js  # Core 4-model logic
│   │   └── betCalculator.js
│   └── data/
│       └── sampleRaces.js  # Sample race/horse data
└── frontend/             # React SPA
    └── src/
        ├── components/
        │   ├── Header.jsx
        │   ├── RaceSelector.jsx
        │   ├── WeatherPanel.jsx
        │   ├── OddsPanel.jsx
        │   ├── ModelComparison.jsx
        │   ├── TopPicks.jsx
        │   ├── ExoticBets.jsx
        │   └── BetCalculator.jsx
        └── context/
            └── RaceContext.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/saratoga-handicapper.git
cd saratoga-handicapper

# 2. Backend
cd backend
npm install
npm start          # runs on http://localhost:3001

# 3. Frontend (new terminal)
cd ../frontend
npm install
npm start          # runs on http://localhost:3000
```

### Environment Variables (backend)
Create `backend/.env`:
```
PORT=3001
WEATHER_API_KEY=your_openweathermap_key   # optional — app uses mock data without it
NODE_ENV=development
```

---

## 📊 Weighting Model

| Factor | Weight Range |
|--------|-------------|
| Speed Figures | 25–35% |
| Pace | 20–25% |
| Jockey / Post | 10–15% |
| Class | 10–15% |
| Form | 10–15% |
| Trainer | 5–10% |
| Distance / Surface | 5–10% |

**Confidence Score** = (40% × model consensus) + (30% × odds value) + (20% × factor alignment) + (10% × sharp money)

---

## ⚠️ Disclaimer

> All predictions are for **entertainment and informed wagering** only. Please gamble responsibly.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, CSS Modules, Chart.js |
| Backend | Node.js, Express 4 |
| HTTP Client | Axios |
| Weather | OpenWeatherMap API (fallback to mock) |
| Deployment | Docker-ready (Dockerfile included) |

---

## 📄 License

MIT
