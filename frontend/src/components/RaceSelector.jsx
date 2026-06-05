import React from 'react';
import { useRace } from '../context/RaceContext';
import './RaceSelector.css';

export default function RaceSelector() {
  const { races, selectedRace, loadRace, loading, trackCondition } = useRace();

  return (
    <div className="race-selector">
      <h2 className="race-selector__title">📋 Race Card</h2>
      <div className="race-selector__list">
        {races.map((r) => (
          <button
            key={r.raceNumber}
            className={`race-card ${selectedRace === r.raceNumber ? 'race-card--active' : ''}`}
            onClick={() => loadRace(r.raceNumber, trackCondition)}
            disabled={loading}
          >
            <div className="race-card__number">R{r.raceNumber}</div>
            <div className="race-card__info">
              <span className="race-card__type">{r.raceType}</span>
              <span className="race-card__details">{r.distance} · {r.surface}</span>
              <span className="race-card__post">{r.postTime}</span>
            </div>
            <div className="race-card__purse">${(r.purse / 1000).toFixed(0)}K</div>
          </button>
        ))}
      </div>
    </div>
  );
}
