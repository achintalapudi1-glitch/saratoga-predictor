import React from 'react';
import { useRace } from '../context/RaceContext';
import './TopPicks.css';

const MEDALS = ['🥇', '🥈', '🥉'];
const ROLE_LABELS = { E: 'Early Speed', P: 'Presser', S: 'Stalker', C: 'Closer' };

export default function TopPicks() {
  const { raceData } = useRace();
  if (!raceData?.top3) return null;

  const { top3, race } = raceData;

  return (
    <div className="top-picks">
      <div className="top-picks__header">
        <h2 className="top-picks__title">🎯 Top 3 Picks</h2>
        <div className="top-picks__race-info">
          {race && (
            <span>{race.raceType} · {race.distance} · {race.surface}</span>
          )}
        </div>
      </div>

      <div className="top-picks__grid">
        {top3.map((pick, i) => {
          const h = pick.horse;
          return (
            <div key={h.programNumber} className={`pick-card pick-card--${i + 1}`}>
              <div className="pick-card__rank-row">
                <span className="pick-card__medal">{MEDALS[i]}</span>
                <span className="pick-card__num">#{h.programNumber}</span>
                {pick.isOverlay && <span className="pick-card__overlay-badge">⚡ Overlay</span>}
                {pick.modelAgrees === 3 && <span className="pick-card__consensus-badge">✓ All Models</span>}
              </div>

              <h3 className="pick-card__name">{h.name}</h3>

              <div className="pick-card__confidence">
                <span className="conf-label">Confidence</span>
                <div className="conf-bar-row">
                  <div className="conf-bar-bg">
                    <div className="conf-bar-fill"
                      style={{ width: `${pick.confidence}%`, '--conf': pick.confidence }}
                    />
                  </div>
                  <span className="conf-value">
                    {pick.confidence}% ± {pick.margin}%
                  </span>
                </div>
              </div>

              <div className="pick-card__meta-grid">
                <MetaItem label="Jockey"   value={h.jockey} />
                <MetaItem label="Trainer"  value={h.trainer} />
                <MetaItem label="Post"     value={`#${h.postPosition}`} />
                <MetaItem label="M/L Odds" value={`${h.morningLine}-1`} />
                <MetaItem label="Win Prob" value={`${pick.winProb}%`} highlight />
                <MetaItem label="Implied"  value={`${pick.implied}%`} />
                <MetaItem label="Pace Role" value={`${pick.role} — ${ROLE_LABELS[pick.role]}`} />
                <MetaItem label="Models ✓"  value={`${pick.modelAgrees}/3`} highlight={pick.modelAgrees === 3} />
              </div>

              <div className="pick-card__figures">
                <span className="pick-card__fig-label">Last 3 Figs:</span>
                {h.lastRaces?.map((f, idx) => (
                  <span key={idx} className={`pick-card__fig ${idx === 0 ? 'pick-card__fig--recent' : ''}`}>{f}</span>
                ))}
                <span className="pick-card__pace-rating">Pace: {h.paceRating}</span>
              </div>

              {h.equipment?.length > 0 && (
                <div className="pick-card__equipment">
                  {h.equipment.map((e, idx) => (
                    <span key={idx} className="pick-card__equip-tag">{e}</span>
                  ))}
                </div>
              )}

              <div className="pick-card__wet-row">
                <span className="wet-record">
                  Wet: {h.wetRecord.wins}W–{h.wetRecord.starts - h.wetRecord.wins}L
                  ({h.wetRecord.starts} starts)
                </span>
                {h.mudSire && <span className="mud-badge">💧 Mud Sire</span>}
              </div>

              <div className="pick-card__days-off">
                ⏱ {h.daysOff} days since last race
                {h.daysOff > 30 && <span className="days-warn"> (layoff concern)</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="top-picks__disclaimer">
        ⚠️ All predictions are for entertainment and informed wagering only. Please gamble responsibly.
      </p>
    </div>
  );
}

function MetaItem({ label, value, highlight }) {
  return (
    <div className={`meta-item ${highlight ? 'meta-item--highlight' : ''}`}>
      <span className="meta-item__label">{label}</span>
      <span className="meta-item__value">{value}</span>
    </div>
  );
}
