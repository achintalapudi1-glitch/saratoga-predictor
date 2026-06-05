import React, { useState } from 'react';
import { useRace } from '../context/RaceContext';
import './ModelComparison.css';

const ROLE_LABELS = { E: 'Early Speed', P: 'Presser', S: 'Stalker', C: 'Closer' };
const ROLE_COLORS = { E: '#e74c3c', P: '#e67e22', S: '#3498db', C: '#9b59b6' };

export default function ModelComparison() {
  const { raceData } = useRace();
  const [showWet, setShowWet] = useState(false);

  if (!raceData) return null;

  const { modelTable, isOffTrack } = raceData;
  if (!modelTable) return null;

  const sorted = [...modelTable].sort((a, b) => a.rankA - b.rankA);

  const isConsensus = (h) => {
    const ranks = [h.rankA, h.rankB, h.rankC];
    return ranks.filter((r) => r <= 3).length >= 3;
  };

  return (
    <div className="model-comp">
      <div className="model-comp__header">
        <h2 className="model-comp__title">📊 Four-Model Analysis</h2>
        {isOffTrack && (
          <button
            className={`model-comp__wet-toggle ${showWet ? 'model-comp__wet-toggle--active' : ''}`}
            onClick={() => setShowWet((v) => !v)}
          >
            {showWet ? '🌧 Wet Rankings ON' : '🌧 Show Wet Rankings'}
          </button>
        )}
      </div>

      <div className="model-legend">
        <span className="legend-pill legend-pill--a">A — Composite</span>
        <span className="legend-pill legend-pill--b">B — Speed Fig</span>
        <span className="legend-pill legend-pill--c">C — Pace/Trip</span>
        <span className="legend-pill legend-pill--d">D — Value</span>
        {showWet && <span className="legend-pill legend-pill--w">W — Wet Track</span>}
      </div>

      <div className="model-table-wrap">
        <table className="model-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Horse</th>
              <th>Jockey</th>
              <th>ML</th>
              <th className="model-col model-col--a">A</th>
              <th className="model-col model-col--b">B</th>
              <th className="model-col model-col--c">C</th>
              <th className="model-col model-col--d">D Edge</th>
              {showWet && <th className="model-col model-col--w">W</th>}
              <th>Pace Role</th>
              <th>Figures</th>
              <th>Equipment</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => {
              const consensus = isConsensus(h);
              return (
                <tr key={h.programNumber}
                  className={`model-row ${consensus ? 'model-row--consensus' : ''} ${h.dIsOverlay ? 'model-row--overlay' : ''}`}
                >
                  <td className="model-cell--num">
                    <span className="prog-badge">{h.programNumber}</span>
                  </td>
                  <td className="model-cell--name">
                    <span className="horse-name">{h.name}</span>
                    {consensus && <span className="consensus-tag">✓ CONSENSUS</span>}
                  </td>
                  <td className="model-cell--jockey">{h.jockey?.split(' ').pop()}</td>
                  <td className="model-cell--ml">{h.morningLine}-1</td>

                  <td className="model-col model-col--a">
                    <RankCell rank={h.rankA} score={h.scoreA} color="var(--green-mid)" />
                  </td>
                  <td className="model-col model-col--b">
                    <RankCell rank={h.rankB} score={h.scoreB} color="var(--blue)" />
                  </td>
                  <td className="model-col model-col--c">
                    <RankCell rank={h.rankC} score={h.scoreC} color="var(--purple)" />
                  </td>
                  <td className="model-col model-col--d">
                    {h.dEdge !== undefined && (
                      <span className={`edge-badge ${h.dEdge >= 10 ? 'edge-badge--overlay' : ''}`}>
                        {h.dEdge >= 0 ? '+' : ''}{h.dEdge}%
                      </span>
                    )}
                  </td>
                  {showWet && (
                    <td className="model-col model-col--w">
                      {h.wetScore !== undefined ? (
                        <span className={`wet-badge ${h.wetMudder ? 'wet-badge--mudder' : ''}`}>
                          {h.wetScore} {h.wetMudder ? '💧' : ''}
                        </span>
                      ) : '—'}
                    </td>
                  )}
                  <td>
                    <span className="role-badge" style={{ background: ROLE_COLORS[h.roleC] + '22', color: ROLE_COLORS[h.roleC] }}>
                      {h.roleC} — {ROLE_LABELS[h.roleC] || '?'}
                    </span>
                  </td>
                  <td className="model-cell--figs">
                    {h.lastRaces?.map((f, i) => (
                      <span key={i} className={`fig-pill ${i === 0 ? 'fig-pill--recent' : ''}`}>{f}</span>
                    ))}
                  </td>
                  <td className="model-cell--equip">
                    {h.equipment?.length > 0
                      ? h.equipment.map((e, i) => <span key={i} className="equip-tag">{e}</span>)
                      : <span className="equip-none">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="model-comp__footnote">
        Bold rows = consensus top 3 across all models. ⚡ Overlay = Model D edge ≥ 10%. 💧 = Mudder/wet sire.
      </p>
    </div>
  );
}

function RankCell({ rank, score, color }) {
  const isTop = rank <= 3;
  return (
    <div className="rank-cell">
      <span className={`rank-num ${isTop ? 'rank-num--top' : ''}`}
        style={isTop ? { background: color, color: '#fff' } : {}}>
        #{rank}
      </span>
      {score !== undefined && (
        <div className="rank-bar-wrap">
          <div className="rank-bar" style={{ width: `${score}%`, background: color }} />
        </div>
      )}
    </div>
  );
}
