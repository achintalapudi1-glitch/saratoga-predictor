import React from 'react';
import { useRace } from '../context/RaceContext';
import './WeatherPanel.css';

const CONDITION_LABELS = {
  fast:     { label: 'Fast',     color: '#27ae60', bg: '#e8f8f0' },
  good:     { label: 'Good',     color: '#2980b9', bg: '#ebf4ff' },
  muddy:    { label: 'Muddy',    color: '#8b4513', bg: '#fdf0e0' },
  sloppy:   { label: 'Sloppy',   color: '#7f8c8d', bg: '#f5f5f5' },
  yielding: { label: 'Yielding', color: '#6c5ce7', bg: '#f3f0ff' },
  soft:     { label: 'Soft',     color: '#00b894', bg: '#e8faf5' },
};

export default function WeatherPanel() {
  const { weather, trackCondition, setTrackCondition, refreshWeather, loadRace, selectedRace } = useRace();

  const cond    = CONDITION_LABELS[trackCondition] || CONDITION_LABELS.fast;
  const w       = weather?.current;
  const isMock  = weather?.source === 'mock';

  const handleConditionChange = (e) => {
    const val = e.target.value;
    setTrackCondition(val);
    if (selectedRace) loadRace(selectedRace, val);
  };

  return (
    <div className="weather-panel">
      <div className="weather-panel__header">
        <h2 className="weather-panel__title">🌤 Weather &amp; Track</h2>
        <button className="weather-panel__refresh" onClick={refreshWeather} title="Refresh weather">
          ↻ Refresh
        </button>
      </div>

      {weather?.alert && (
        <div className="weather-panel__alert">
          {weather.alert}
        </div>
      )}

      {w && (
        <div className="weather-panel__grid">
          <div className="weather-stat">
            <span className="weather-stat__label">Temp</span>
            <span className="weather-stat__value">{w.temp}°F</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat__label">Humidity</span>
            <span className="weather-stat__value">{w.humidity}%</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat__label">Wind</span>
            <span className="weather-stat__value">{w.windSpeed} mph</span>
          </div>
          <div className="weather-stat">
            <span className="weather-stat__label">Rain%</span>
            <span className="weather-stat__value"
              style={{ color: weather.rainProbability >= 40 ? 'var(--red)' : 'inherit' }}>
              {weather.rainProbability}%
            </span>
          </div>
        </div>
      )}

      <div className="weather-panel__condition-row">
        <div className="weather-panel__badge" style={{ background: cond.bg, color: cond.color }}>
          Track: <strong>{cond.label}</strong>
        </div>

        <div className="weather-panel__override">
          <label htmlFor="track-cond">Override:</label>
          <select id="track-cond" value={trackCondition} onChange={handleConditionChange}>
            {Object.entries(CONDITION_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {weather?.wetScenario && (
        <p className="weather-panel__wet-note">
          ⚠️ Rain possible — wet-track rankings enabled in Race Analysis below.
        </p>
      )}

      {isMock && (
        <p className="weather-panel__source">
          ℹ️ Using mock weather — add <code>WEATHER_API_KEY</code> to backend .env for live data.
        </p>
      )}

      {weather?.hourly && (
        <div className="weather-panel__hourly">
          {weather.hourly.map((h, i) => (
            <div key={i} className="weather-hourly-item">
              <span className="weather-hourly-item__time">{h.time}</span>
              <span className="weather-hourly-item__temp">{h.temp}°</span>
              <span className="weather-hourly-item__rain"
                style={{ color: h.rainProb >= 40 ? 'var(--red)' : 'var(--gray-500)' }}>
                💧{h.rainProb}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
