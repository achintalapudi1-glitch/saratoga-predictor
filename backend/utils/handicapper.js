/**
 * Core Handicapping Engine — Saratoga Race Course
 * Implements all four models (A, B, C, D) plus confidence scoring.
 */

// ── Weights ─────────────────────────────────────────────────────────────────
const WEIGHTS = {
  speedFigure:  0.30,  // 25–35%
  pace:         0.22,  // 20–25%
  jockeyPost:   0.12,  // 10–15%
  classRating:  0.12,  // 10–15%
  form:         0.12,  // 10–15%
  trainer:      0.07,  // 5–10%
  distSurface:  0.05,  // 5–10%
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Average of an array */
const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;

/** Normalise a value to 0–100 given a min/max spread */
const normalise = (val, min, max) =>
  max === min ? 50 : Math.round(((val - min) / (max - min)) * 100);

/** Odds → implied win probability (%) */
const oddsToImplied = (odds) => Math.round((1 / (odds + 1)) * 100 * 10) / 10;

/** Post position score — inside posts better on dirt, outside on turf */
const postScore = (post, surface) => {
  if (surface === 'Turf') return Math.max(0, 100 - (post - 1) * 8);
  return Math.max(0, 100 - Math.abs(post - 3) * 10); // sweet spot 2–4 on dirt
};

/** Form freshness — penalise >30 days off */
const freshnessScore = (daysOff) => {
  if (daysOff <= 14) return 100;
  if (daysOff <= 21) return 90;
  if (daysOff <= 30) return 80;
  if (daysOff <= 45) return 65;
  return 50;
};

// ─────────────────────────────────────────────────────────────────────────────
// Model A — Weighted Composite
// ─────────────────────────────────────────────────────────────────────────────
function modelA(horses, surface = 'Dirt') {
  const scores = horses.map((h) => {
    const speedAvg     = avg(h.lastRaces);
    const jockeyScore  = (h.jockeyWinPct * 100) * 0.6 + postScore(h.postPosition, surface) * 0.4;
    const trainerScore = h.trainerWinPct * 100;
    const formScore    = (avg(h.lastRaces) * 0.5) + (freshnessScore(h.daysOff) * 0.5);

    const raw =
      speedAvg       * WEIGHTS.speedFigure +
      h.paceRating   * WEIGHTS.pace +
      jockeyScore    * WEIGHTS.jockeyPost +
      h.classRating  * WEIGHTS.classRating +
      formScore      * WEIGHTS.form +
      trainerScore   * WEIGHTS.trainer +
      h.formRating   * WEIGHTS.distSurface;

    return { horse: h, raw };
  });

  const vals = scores.map((s) => s.raw);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);

  return scores
    .map((s) => ({ ...s, score: normalise(s.raw, min, max) }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Model B — Speed Figure
// ─────────────────────────────────────────────────────────────────────────────
function modelB(horses) {
  const scores = horses.map((h) => {
    const best3avg  = avg(h.lastRaces);
    const bestFig   = Math.max(...h.lastRaces);
    const recency   = h.lastRaces[0]; // most recent
    const raw       = bestFig * 0.40 + best3avg * 0.35 + recency * 0.25;
    return { horse: h, raw, bestFig, avg3: Math.round(best3avg) };
  });

  const vals = scores.map((s) => s.raw);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);

  return scores
    .map((s) => ({ ...s, score: normalise(s.raw, min, max) }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Model C — Pace / Trip
// ─────────────────────────────────────────────────────────────────────────────
function modelC(horses) {
  // Classify pace role: E=early speed, P=presser, S=stalker, C=closer
  const classify = (paceRating) => {
    if (paceRating >= 92) return 'E';
    if (paceRating >= 86) return 'P';
    if (paceRating >= 80) return 'S';
    return 'C';
  };

  // Pace shape score — early speed advantaged, penalise lone-speed burnout
  const earlyCount = horses.filter((h) => h.paceRating >= 92).length;
  const isSlow     = earlyCount <= 1; // lone speed = +bonus
  const isFrantic  = earlyCount >= 3; // contested pace = closers preferred

  const scores = horses.map((h) => {
    const role  = classify(h.paceRating);
    let bonus   = 0;
    if (isSlow  && role === 'E') bonus = 8;   // lone speed advantage
    if (isFrantic && role === 'C') bonus = 6; // closers if pace meltdown
    if (isFrantic && role === 'E') bonus = -5; // early speed hurt

    const raw = h.paceRating + bonus;
    return { horse: h, raw, role, isSlow, isFrantic };
  });

  const vals = scores.map((s) => s.raw);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);

  return scores
    .map((s) => ({ ...s, score: normalise(s.raw, min, max) }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Model D — Value / Contrarian
// ─────────────────────────────────────────────────────────────────────────────
function modelD(horses, modelAResults) {
  // Calculate Model A win probabilities (softmax-style)
  const expScores = modelAResults.map((r) => Math.exp(r.score / 20));
  const total     = expScores.reduce((s, v) => s + v, 0);
  const winProbs  = expScores.map((e) => (e / total) * 100);

  const overlays = modelAResults.map((r, i) => {
    const implied = oddsToImplied(r.horse.morningLine);
    const winProb = winProbs[i];
    const edge    = winProb - implied;
    const isOverlay = edge >= 10;
    return {
      horse:      r.horse,
      score:      Math.max(0, Math.round(winProb * 2)), // value score
      winProb:    Math.round(winProb * 10) / 10,
      implied,
      edge:       Math.round(edge * 10) / 10,
      isOverlay,
      raw:        winProb,
    };
  });

  return overlays.sort((a, b) => b.edge - a.edge);
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence score
// ─────────────────────────────────────────────────────────────────────────────
function calcConfidence(horse, modelResults, liveOdds = null) {
  const { A, B, C, D } = modelResults;
  const topN = (arr, n) => arr.slice(0, n).map((r) => r.horse.programNumber);

  const top3A = topN(A, 3);
  const top3B = topN(B, 3);
  const top3C = topN(C, 3);
  const num   = horse.programNumber;

  const rankA = A.findIndex((r) => r.horse.programNumber === num) + 1;
  const rankB = B.findIndex((r) => r.horse.programNumber === num) + 1;
  const rankC = C.findIndex((r) => r.horse.programNumber === num) + 1;
  const dEntry = D.find((r) => r.horse.programNumber === num);

  // Consensus: how many of A/B/C have this horse in top 3?
  const agrees  = [top3A, top3B, top3C].filter((t) => t.includes(num)).length;
  const consensus = (agrees / 3) * 100;

  // Odds value
  const implied = oddsToImplied(horse.morningLine);
  const dEdge   = dEntry ? Math.max(0, dEntry.edge) : 0;
  const oddsVal = Math.min(100, implied + dEdge * 1.5);

  // Factor alignment — avg rank across 3 models
  const avgRank = (rankA + rankB + rankC) / 3;
  const factorAlign = Math.max(0, 100 - (avgRank - 1) * 18);

  // Sharp money (placeholder — in prod use live tote % vs ML)
  const sharpMoney = liveOdds
    ? Math.min(100, Math.max(0, (horse.morningLine - liveOdds) / horse.morningLine * 200))
    : 50;

  const raw =
    consensus   * 0.40 +
    oddsVal     * 0.30 +
    factorAlign * 0.20 +
    sharpMoney  * 0.10;

  const score = Math.round(raw);
  const margin = agrees < 3 ? 12 : 6;

  return { score, margin, agrees };
}

// ─────────────────────────────────────────────────────────────────────────────
// Wet-track re-ranking
// ─────────────────────────────────────────────────────────────────────────────
function wetRanking(horses) {
  const scores = horses.map((h) => {
    const wetPct   = h.wetRecord.starts > 0
      ? h.wetRecord.wins / h.wetRecord.starts
      : 0;
    const raw = (avg(h.lastRaces) * 0.4) + (wetPct * 100 * 0.35) + (h.paceRating * 0.25);
    return { horse: h, raw, mudder: h.mudSire || wetPct >= 0.5 };
  });

  const vals = scores.map((s) => s.raw);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);

  return scores
    .map((s) => ({ ...s, score: normalise(s.raw, min, max) }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main analyser
// ─────────────────────────────────────────────────────────────────────────────
function analyseRace(race, weatherCondition = 'fast') {
  const { horses, surface } = race;
  const isOffTrack = ['sloppy', 'muddy', 'good', 'yielding', 'soft'].includes(
    weatherCondition.toLowerCase()
  );

  const A = modelA(horses, surface);
  const B = modelB(horses);
  const C = modelC(horses);
  const D = modelD(horses, A);
  const W = isOffTrack ? wetRanking(horses) : null;

  const modelResults = { A, B, C, D, W };

  // Top 3 overall picks
  const numHorses = horses.length;
  const allNums   = horses.map((h) => h.programNumber);

  // Consensus ranking: sum of ranks across A, B, C
  const consensusMap = {};
  allNums.forEach((num) => {
    const rankA = A.findIndex((r) => r.horse.programNumber === num) + 1 || numHorses;
    const rankB = B.findIndex((r) => r.horse.programNumber === num) + 1 || numHorses;
    const rankC = C.findIndex((r) => r.horse.programNumber === num) + 1 || numHorses;
    consensusMap[num] = rankA + rankB + rankC;
  });

  const sortedByConsensus = [...allNums].sort(
    (a, b) => consensusMap[a] - consensusMap[b]
  );

  const top3 = sortedByConsensus.slice(0, 3).map((num) => {
    const horse = horses.find((h) => h.programNumber === num);
    const conf  = calcConfidence(horse, modelResults);
    const dEntry = D.find((r) => r.horse.programNumber === num);

    return {
      horse,
      confidence:  conf.score,
      margin:      conf.margin,
      modelAgrees: conf.agrees,
      isOverlay:   dEntry?.isOverlay || false,
      winProb:     dEntry?.winProb || 0,
      implied:     oddsToImplied(horse.morningLine),
      role:        C.find((r) => r.horse.programNumber === num)?.role || '?',
    };
  });

  return { modelResults, top3, isOffTrack };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exotic recommendations
// ─────────────────────────────────────────────────────────────────────────────
function exoticRecommendations(top3, allHorses) {
  const [p1, p2, p3] = top3.map((t) => t.horse.programNumber);
  const longshots     = allHorses
    .filter((h) => h.morningLine >= 10 && !top3.find((t) => t.horse.programNumber === h.programNumber))
    .map((h) => h.programNumber)
    .slice(0, 2);

  const n = allHorses.length;

  return {
    win:        { horses: [p1], est: top3[0].horse.morningLine },
    place:      { horses: [p1, p2], note: 'Insurance on top 2' },
    show:       { horses: [p1, p2, p3] },
    exactaStraight: {
      horses:  [p1, p2],
      estPayout: Math.round(top3[0].horse.morningLine * top3[1].horse.morningLine * 0.7),
      hitProb: `${Math.round((1 / (top3[0].horse.morningLine + 1)) * (1 / (top3[1].horse.morningLine + 1)) * 100 * 10) / 10}%`,
    },
    exactaBox: {
      horses:  [p1, p2],
      cost:    '$2 × 2 = $4',
      estPayout: Math.round(top3[0].horse.morningLine * top3[1].horse.morningLine * 0.5),
    },
    trifectaStraight: {
      horses:  [p1, p2, p3],
      estPayout: Math.round(
        top3[0].horse.morningLine * top3[1].horse.morningLine * top3[2].horse.morningLine * 0.8
      ),
      hitProb: `~${Math.round((1 / ((top3[0].horse.morningLine + 1) * (top3[1].horse.morningLine + 1) * (top3[2].horse.morningLine + 1))) * 100 * 100) / 100}%`,
    },
    trifectaBox: {
      horses:  [p1, p2, p3],
      cost:    '$1 × 6 combos = $6',
      estPayout: Math.round(
        top3[0].horse.morningLine * top3[1].horse.morningLine * top3[2].horse.morningLine * 0.5
      ),
    },
    superfectaBox: {
      horses: [p1, p2, p3, longshots[0] || (p3 + 1 <= n ? p3 + 1 : 1)],
      cost:   '$0.10 × 24 combos = $2.40',
      estPayout: 'Varies (100–500x)',
    },
  };
}

module.exports = { analyseRace, exoticRecommendations, oddsToImplied };
