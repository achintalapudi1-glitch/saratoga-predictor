/**
 * Bet Calculator — Saratoga Race Course Handicapper
 * Computes cost, potential payout, ROI%, and hit probability for any exotic bet.
 */

const BET_TYPES = {
  win:        { minStake: 2,    combos: (h) => 1 },
  place:      { minStake: 2,    combos: (h) => 1 },
  show:       { minStake: 2,    combos: (h) => 1 },
  exacta:     { minStake: 2,    combos: (h) => h.length * (h.length - 1) },
  exactabox:  { minStake: 2,    combos: (h) => h.length * (h.length - 1) },
  trifecta:   { minStake: 1,    combos: (h) => h.length * (h.length - 1) * (h.length - 2) },
  trifectabox:{ minStake: 1,    combos: (h) => h.length * (h.length - 1) * (h.length - 2) },
  superfecta: { minStake: 0.10, combos: (h) => h.length * (h.length - 1) * (h.length - 2) * (h.length - 3) },
  pick3:      { minStake: 0.50, combos: (h) => h.reduce((p, r) => p * r, 1) },
  pick4:      { minStake: 0.50, combos: (h) => h.reduce((p, r) => p * r, 1) },
  pick5:      { minStake: 0.50, combos: (h) => h.reduce((p, r) => p * r, 1) },
  pick6:      { minStake: 0.20, combos: (h) => h.reduce((p, r) => p * r, 1) },
  hi5:        { minStake: 0.20, combos: (h) => h.length * (h.length - 1) * (h.length - 2) * (h.length - 3) * (h.length - 4) },
};

/**
 * Parse a bet string like "$20 trifecta box 3-5-7"
 * Returns { stake, betType, horses, isBox }
 */
function parseBet(betString) {
  const s = betString.toLowerCase().trim();

  // Extract stake — first $ amount or leading number
  const stakeMatch = s.match(/\$\s*([\d.]+)/) || s.match(/^([\d.]+)/);
  const stake = stakeMatch ? parseFloat(stakeMatch[1]) : 2;

  const typeMatch = s.match(
    /\b(win|place|show|exacta|trifecta|superfecta|pick[3456]|hi.?5)\b/
  );
  const isBox   = s.includes('box');
  const betType = typeMatch
    ? typeMatch[1].replace(/[\s.]/g, '') + (isBox ? 'box' : '')
    : 'win';

  // Extract horse numbers — digits after the bet-type keyword
  const afterType = typeMatch ? s.slice(s.indexOf(typeMatch[0]) + typeMatch[0].length) : s;
  const horses    = (afterType.match(/\d+/g) || []).map(Number).filter(Boolean);

  return { stake, betType, horses, isBox };
}

/**
 * Calculate bet details.
 * @param {number}   stake    - dollar amount per unit (e.g. 2)
 * @param {string}   betType  - 'exactabox', 'trifecta', etc.
 * @param {number[]} horses   - array of program numbers (or per-race counts for pick bets)
 * @param {number}   payoutOdds - estimated payout (optional, used for ROI)
 */
function calculateBet(stake, betType, horses, payoutOdds = null) {
  const type = BET_TYPES[betType.toLowerCase()];
  if (!type) return { error: `Unknown bet type: ${betType}` };

  const numHorses = horses.length;
  if (numHorses < 1) return { error: 'No horses specified' };

  const combos     = type.combos(horses);
  const totalCost  = Math.round(stake * combos * 100) / 100;
  const minStake   = type.minStake;
  const effectiveStake = Math.max(stake, minStake);
  const effectiveCost  = Math.round(effectiveStake * combos * 100) / 100;

  // Estimate payout & ROI
  const payout    = payoutOdds ? Math.round(effectiveStake * payoutOdds * combos * 100) / 100 : null;
  const roi       = payout ? Math.round(((payout - effectiveCost) / effectiveCost) * 100) : null;

  // Hit probability estimate (rough)
  const hitProb = estimateHitProb(betType, horses);

  return {
    betType,
    stake:         effectiveStake,
    horses,
    combos,
    totalCost:     effectiveCost,
    estimatedPayout: payout,
    roi:           roi !== null ? `${roi}%` : 'N/A',
    hitProbability: hitProb,
    minStake,
  };
}

/**
 * Rough hit probability based on bet type and number of combos.
 */
function estimateHitProb(betType, horses) {
  const n = horses.length;
  const base = {
    win:         '20–33%',
    place:       '35–50%',
    show:        '50–65%',
    exacta:      '8–15%',
    exactabox:   '15–25%',
    trifecta:    '2–5%',
    trifectabox: '4–10%',
    superfecta:  '0.5–2%',
    pick3:       '3–8%',
    pick4:       '1–4%',
    pick5:       '0.5–2%',
    pick6:       '0.1–0.5%',
    hi5:         '0.2–1%',
  };
  return base[betType.toLowerCase()] || 'Unknown';
}

/**
 * Full slate summary — given an array of individual bets
 */
function slateSummary(bets) {
  const results   = bets.map((b) => calculateBet(b.stake, b.betType, b.horses, b.payoutOdds));
  const totalSpend = results.reduce((s, r) => s + (r.totalCost || 0), 0);
  return { bets: results, totalSpend: Math.round(totalSpend * 100) / 100 };
}

module.exports = { calculateBet, parseBet, slateSummary, BET_TYPES };
