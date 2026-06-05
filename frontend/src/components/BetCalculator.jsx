import React, { useState } from 'react';
import { calcBet, parseBetString } from '../utils/api';
import './BetCalculator.css';

const BET_TYPES = [
  'win','place','show',
  'exacta','exactabox',
  'trifecta','trifectabox',
  'superfecta',
  'pick3','pick4','pick5','pick6','hi5',
];

const EXAMPLES = [
  '$10 win 2',
  '$20 exactabox 2-4',
  '$2 trifectabox 1-3-5',
  '$0.10 superfecta 2-4-1-3',
  '$1 pick4 2-4-1-3',
];

export default function BetCalculator() {
  const [mode,       setMode]       = useState('form'); // 'form' | 'text'
  const [betString,  setBetString]  = useState('');
  const [stake,      setStake]      = useState('2');
  const [betType,    setBetType]    = useState('exactabox');
  const [horses,     setHorses]     = useState('');
  const [payoutOdds, setPayoutOdds] = useState('');
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const handleFormCalc = async () => {
    setLoading(true);
    setError(null);
    try {
      const horseArr = horses.split(/[-,\s]+/).map(Number).filter(Boolean);
      const data = await calcBet({
        stake:      parseFloat(stake) || 2,
        betType,
        horses:     horseArr,
        payoutOdds: payoutOdds ? parseFloat(payoutOdds) : undefined,
      });
      setResult(data);
    } catch (e) {
      setError(e.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTextCalc = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parseBetString(betString);
      setResult(data.result);
    } catch (e) {
      setError(e.message || 'Could not parse bet string');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex) => {
    setBetString(ex);
    setMode('text');
  };

  return (
    <div className="bet-calc">
      <h2 className="bet-calc__title">🧮 Bet Calculator</h2>
      <p className="bet-calc__subtitle">Enter any bet to see cost, payout, ROI%, and hit probability.</p>

      {/* Mode toggle */}
      <div className="bet-calc__mode-toggle">
        <button className={`mode-btn ${mode === 'form' ? 'mode-btn--active' : ''}`}
          onClick={() => setMode('form')}>
          📝 Form
        </button>
        <button className={`mode-btn ${mode === 'text' ? 'mode-btn--active' : ''}`}
          onClick={() => setMode('text')}>
          💬 Text Input
        </button>
      </div>

      {/* Quick examples */}
      <div className="bet-calc__examples">
        <span className="bet-calc__examples-label">Examples:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} className="example-chip" onClick={() => handleExample(ex)}>{ex}</button>
        ))}
      </div>

      {/* Form mode */}
      {mode === 'form' && (
        <div className="bet-calc__form">
          <div className="form-row">
            <div className="form-field">
              <label>Stake ($)</label>
              <input type="number" min="0.10" step="0.10" value={stake}
                onChange={(e) => setStake(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Bet Type</label>
              <select value={betType} onChange={(e) => setBetType(e.target.value)}>
                {BET_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field form-field--wide">
              <label>Horses (e.g. 1-3-5 or 1,3,5)</label>
              <input type="text" placeholder="2-4-1-3" value={horses}
                onChange={(e) => setHorses(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Est. Payout Odds (optional)</label>
              <input type="number" min="0" step="1" placeholder="e.g. 45" value={payoutOdds}
                onChange={(e) => setPayoutOdds(e.target.value)} />
            </div>
          </div>
          <button className="calc-btn" onClick={handleFormCalc} disabled={loading || !horses}>
            {loading ? 'Calculating…' : '⚡ Calculate'}
          </button>
        </div>
      )}

      {/* Text mode */}
      {mode === 'text' && (
        <div className="bet-calc__text">
          <div className="form-field">
            <label>Bet String (e.g. "$20 trifecta box 3-5-7")</label>
            <input type="text" placeholder='$20 trifecta box 3-5-7'
              value={betString} onChange={(e) => setBetString(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextCalc()} />
          </div>
          <button className="calc-btn" onClick={handleTextCalc} disabled={loading || !betString}>
            {loading ? 'Parsing…' : '⚡ Calculate'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && <div className="bet-calc__error">❌ {error}</div>}

      {/* Result */}
      {result && !result.error && (
        <div className="bet-calc__result">
          <h3 className="result__title">📊 Bet Summary</h3>
          <div className="result__grid">
            <ResultStat label="Bet Type"       value={result.betType} />
            <ResultStat label="Horses"         value={result.horses?.join(' → #') ? '#' + result.horses.join(' → #') : '—'} />
            <ResultStat label="Combinations"   value={result.combos} />
            <ResultStat label="Stake / Combo"  value={`$${result.stake}`} />
            <ResultStat label="Total Cost"     value={`$${result.totalCost}`} highlight />
            <ResultStat label="Est. Payout"    value={result.estimatedPayout ? `$${result.estimatedPayout}` : 'N/A (add payout odds)'} />
            <ResultStat label="ROI"            value={result.roi || 'N/A'} highlight={result.roi && result.roi !== 'N/A'} />
            <ResultStat label="Hit Probability" value={result.hitProbability} />
          </div>
          {result.minStake && result.stake < result.minStake && (
            <p className="result__warn">
              ⚠️ Min stake for {result.betType} is ${result.minStake} — adjusted automatically.
            </p>
          )}
        </div>
      )}

      {result?.error && (
        <div className="bet-calc__error">❌ {result.error}</div>
      )}
    </div>
  );
}

function ResultStat({ label, value, highlight }) {
  return (
    <div className={`result-stat ${highlight ? 'result-stat--highlight' : ''}`}>
      <span className="result-stat__label">{label}</span>
      <span className="result-stat__value">{value}</span>
    </div>
  );
}
