import React from 'react';
import { RaceProvider, useRace } from './context/RaceContext';
import Header from './components/Header';
import WeatherPanel from './components/WeatherPanel';
import RaceSelector from './components/RaceSelector';
import OddsPanel from './components/OddsPanel';
import ModelComparison from './components/ModelComparison';
import TopPicks from './components/TopPicks';
import ExoticBets from './components/ExoticBets';
import BetCalculator from './components/BetCalculator';
import './App.css';

function Dashboard() {
  const { raceData, loading, error, selectedRace } = useRace();

  return (
    <div className="app">
      <Header />

      <main className="app__main">
        {/* Left sidebar */}
        <aside className="app__sidebar">
          <WeatherPanel />
          <RaceSelector />
          <BetCalculator />
        </aside>

        {/* Main content */}
        <section className="app__content">
          {error && (
            <div className="app__error">
              ❌ Error: {error}
            </div>
          )}

          {loading && (
            <div className="app__loading">
              <div className="loading-spinner" />
              <p>Loading race analysis…</p>
            </div>
          )}

          {!selectedRace && !loading && (
            <div className="app__welcome">
              <div className="welcome-card">
                <div className="welcome-card__icon">🏇</div>
                <h2>Welcome to Saratoga Handicapper</h2>
                <p>Select a race from the Race Card on the left to see full AI-powered analysis including:</p>
                <ul>
                  <li>📊 Four-model side-by-side comparison (Composite, Speed, Pace, Value)</li>
                  <li>🎯 Top 3 picks with confidence scores</li>
                  <li>🎰 Exotic bet recommendations with payout estimates</li>
                  <li>🌧 Wet-track scenarios if rain is expected</li>
                  <li>⚡ Overlay/value bet alerts</li>
                </ul>
                <p className="welcome-card__disclaimer">
                  ⚠️ All predictions are for entertainment and informed wagering only. Wager responsibly.
                </p>
              </div>
            </div>
          )}

          {raceData && !loading && (
            <>
              <div className="race-header">
                <div className="race-header__info">
                  <h2 className="race-header__title">
                    Race {raceData.race?.raceNumber} — {raceData.race?.raceType}
                  </h2>
                  <div className="race-header__meta">
                    <span className="race-meta-pill">{raceData.race?.distance}</span>
                    <span className="race-meta-pill">{raceData.race?.surface}</span>
                    <span className="race-meta-pill">{raceData.race?.ageRestriction}</span>
                    <span className="race-meta-pill race-meta-pill--purse">
                      💰 ${(raceData.race?.purse / 1000).toFixed(0)}K purse
                    </span>
                    {raceData.race?.claimingPrice && (
                      <span className="race-meta-pill">
                        Claiming ${(raceData.race.claimingPrice / 1000).toFixed(0)}K
                      </span>
                    )}
                    <span className="race-meta-pill">⏰ {raceData.race?.postTime}</span>
                  </div>
                </div>
                {raceData.isOffTrack && (
                  <div className="race-header__wet-alert">
                    🌧 Off-Track — Wet Rankings Available
                  </div>
                )}
              </div>

              <OddsPanel />
              <ModelComparison />
              <TopPicks />
              <ExoticBets />
            </>
          )}
        </section>
      </main>

      <footer className="app__footer">
        <p>
          🏇 Saratoga Race Course Handicapper &mdash; Built for the 2025 Saratoga Meet &mdash;
          <span className="footer-disclaimer"> For entertainment only. Please gamble responsibly. 21+</span>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <RaceProvider>
      <Dashboard />
    </RaceProvider>
  );
}
