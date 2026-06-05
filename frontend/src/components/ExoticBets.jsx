import React, { useState } from 'react';
import { useRace } from '../context/RaceContext';
import './ExoticBets.css';

const BET_ICONS = {
  win: '🏆', place: '🥈', show: '🥉',
  exactaStraight: '🎯', exactaBox: '🎯',
  trifectaStraight: '🎲', trifectaBox: '🎲',
  superfectaBox: '💫', pick3: '🔗', pick4: '🔗', pick5: '🔗', pick6: '🔗', hi5: '⭐',
};

const BET_DESCRIPTIONS = {
  win:              'Horse finishes 1st',
  place:            'Horse finishes 1st or 2nd',
  show:             'Horse finishes 1st, 2nd or 3rd',
  exactaStraight:   '1st + 2nd in exact order',
  exactaBox:        '1st + 2nd in any order',
  trifectaStraight: '1st, 2nd, 3rd in exact order',
  trifectaBox:      '1st, 2nd, 3rd in any order',
  superfectaBox:    '1st through 4th in any order ($0.10 base)',
  pick3:            'Winners of 3 consecutive races',
  pick4:            'Winners of 4 consecutive races',
  pick5:            'Winners of 5 consecutive races',
  pick6:            'Winners of 6 consecutive races',
  hi5:              'Exact order of top 5 finishers',
};

export default function ExoticBets() {
  const { raceData } = useRace();
  const [showRain, setShowRain] = useState(false);

  if (!raceData?.exotics) return null;

  const { exotics, top3, isOffTrack } = raceData;
  const horses = raceData.modelTable || [];

  const rainTop3 = isOffTrack
    ? [...horses]
        .filter((h) => h.wetScore !== undefined)
        .sort((a, b) => b.wetScore - a.wetScore)
        .slice(0, 3)
    : null;

  const display = showRain && rainTop3 ? buildWetExotics(rainTop3) : exotics;

  return (
    <div className="exotic-bets">
      <div className="exotic-bets__header">
        <h2 className="exotic-bets__title">🎰 Exotic Bet Recommendations</h2>
        {isOffTrack && (
          <button
            className={`exotic-bets__rain-toggle ${showRain ? 'exotic-bets__rain-toggle--active' : ''}`}
            onClick={() => setShowRain((v) => !v)}
          >
            {showRain ? '🌧 Rain Combos ON' : '🌧 Rain Scenario'}
          </button>
        )}
      </div>

      {showRain && (
        <div className="exotic-bets__rain-note">
          ⚠️ Rain scenario active — combinations re-ordered by wet-track rankings.
        </div>
      )}

      <div className="exotic-bets__grid">
        <ExoticCard icon={BET_ICONS.win} title="Win" desc={BET_DESCRIPTIONS.win}
          horses={display.win?.horses} odds={display.win?.est}
          hitProb="20–33%" cost="$2 base" />

        <ExoticCard icon={BET_ICONS.place} title="Place" desc={BET_DESCRIPTIONS.place}
          horses={display.place?.horses} note={display.place?.note}
          hitProb="35–50%" cost="$2 base" />

        <ExoticCard icon={BET_ICONS.show} title="Show" desc={BET_DESCRIPTIONS.show}
          horses={display.show?.horses}
          hitProb="50–65%" cost="$2 base" />

        <ExoticCard icon={BET_ICONS.exactaStraight} title="Exacta (Straight)"
          desc={BET_DESCRIPTIONS.exactaStraight}
          horses={display.exactaStraight?.horses}
          odds={display.exactaStraight?.estPayout}
          hitProb={display.exactaStraight?.hitProb}
          cost="$2" />

        <ExoticCard icon={BET_ICONS.exactaBox} title="Exacta Box"
          desc={BET_DESCRIPTIONS.exactaBox}
          horses={display.exactaBox?.horses}
          odds={display.exactaBox?.estPayout}
          hitProb="15–25%" cost={display.exactaBox?.cost} />

        <ExoticCard icon={BET_ICONS.trifectaStraight} title="Trifecta (Straight)"
          desc={BET_DESCRIPTIONS.trifectaStraight}
          horses={display.trifectaStraight?.horses}
          odds={display.trifectaStraight?.estPayout}
          hitProb={display.trifectaStraight?.hitProb}
          cost="$1" />

        <ExoticCard icon={BET_ICONS.trifectaBox} title="Trifecta Box"
          desc={BET_DESCRIPTIONS.trifectaBox}
          horses={display.trifectaBox?.horses}
          odds={display.trifectaBox?.estPayout}
          hitProb="4–10%" cost={display.trifectaBox?.cost} />

        <ExoticCard icon={BET_ICONS.superfectaBox} title="Superfecta Box"
          desc={BET_DESCRIPTIONS.superfectaBox}
          horses={display.superfectaBox?.horses}
          odds={display.superfectaBox?.estPayout}
          hitProb="0.5–2%" cost={display.superfectaBox?.cost} />
      </div>
    </div>
  );
}

function ExoticCard({ icon, title, desc, horses, odds, hitProb, cost, note }) {
  return (
    <div className="exotic-card">
      <div className="exotic-card__header">
        <span className="exotic-card__icon">{icon}</span>
        <div>
          <h4 className="exotic-card__title">{title}</h4>
          <p className="exotic-card__desc">{desc}</p>
        </div>
      </div>

      {horses?.length > 0 && (
        <div className="exotic-card__horses">
          {horses.map((h, i) => (
            <React.Fragment key={h}>
              <span className="exotic-card__horse-num">#{h}</span>
              {i < horses.length - 1 && <span className="exotic-card__arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="exotic-card__stats">
        {odds && (
          <div className="exotic-stat">
            <span className="exotic-stat__label">Est. Payout</span>
            <span className="exotic-stat__value">${odds}</span>
          </div>
        )}
        {hitProb && (
          <div className="exotic-stat">
            <span className="exotic-stat__label">Hit Prob</span>
            <span className="exotic-stat__value exotic-stat__value--prob">{hitProb}</span>
          </div>
        )}
        {cost && (
          <div className="exotic-stat">
            <span className="exotic-stat__label">Min Cost</span>
            <span className="exotic-stat__value">{cost}</span>
          </div>
        )}
      </div>

      {note && <p className="exotic-card__note">💡 {note}</p>}
    </div>
  );
}

function buildWetExotics(rainTop3) {
  const [p1, p2, p3] = rainTop3.map((h) => h.programNumber);
  return {
    win:              { horses: [p1], est: rainTop3[0]?.morningLine },
    place:            { horses: [p1, p2], note: 'Wet-track re-ranked' },
    show:             { horses: [p1, p2, p3] },
    exactaStraight:   { horses: [p1, p2], estPayout: 'N/A', hitProb: 'N/A' },
    exactaBox:        { horses: [p1, p2], cost: '$4', estPayout: 'N/A' },
    trifectaStraight: { horses: [p1, p2, p3], estPayout: 'N/A', hitProb: 'N/A' },
    trifectaBox:      { horses: [p1, p2, p3], cost: '$6', estPayout: 'N/A' },
    superfectaBox:    { horses: [p1, p2, p3, p3 + 1], cost: '$2.40', estPayout: 'Varies' },
  };
}
