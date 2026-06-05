import React from 'react';
import { useRace } from '../context/RaceContext';
import './OddsPanel.css';

const oddsToImplied = (odds) => Math.round((1 / (odds + 1)) * 100 * 10) / 10;

export default function OddsPanel() {
  const { raceData } = useRace();
  if (!raceData) return null;

  const horses = raceData.modelTable || [];

  return (
    <div className="odds-panel">
      <h2 className="odds-panel__title">💰 Morning Line Odds</h2>
      <p className="odds-panel__note">Live tote unavailable — using morning line. Sharp money alerts trigger on 20%+ ML move.</p>
      <div className="odds-table">
        {horses
          .slice()
          .sort((a, b) => a.morningLine - b.morningLine)
          .map((h) => {
            const implied = oddsToImplied(h.morningLine);
            const isFav   = h.morningLine <= 3;
            return (
              <div key={h.programNumber} className={`odds-row ${isFav ? 'odds-row--fav' : ''}`}>
                <span className="odds-row__num">#{h.programNumber}</span>
                <span className="odds-row__name">{h.name}</span>
                <span className="odds-row__odds">{h.morningLine}-1</span>
                <div className="odds-row__bar-wrap">
                  <div className="odds-row__bar" style={{ width: `${Math.min(100, implied * 2)}%` }} />
                </div>
                <span className="odds-row__implied">{implied}%</span>
                {isFav && <span className="odds-row__fav-badge">FAV</span>}
                {h.dIsOverlay && <span className="odds-row__overlay">⚡ OVERLAY</span>}
              </div>
            );
          })}
      </div>
      <p className="odds-panel__disclaimer">
        ℹ️ Morning line — add live tote feed for real-time sharp money tracking.
      </p>
    </div>
  );
}
