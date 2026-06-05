const express = require('express');
const router  = express.Router();
const { RACES } = require('../data/sampleRaces');
const { analyseRace, exoticRecommendations } = require('../utils/handicapper');

// GET /api/races — list all races
router.get('/', (_req, res) => {
  const summary = RACES.map((r) => ({
    raceNumber:  r.raceNumber,
    date:        r.date,
    postTime:    r.postTime,
    distance:    r.distance,
    surface:     r.surface,
    raceType:    r.raceType,
    purse:       r.purse,
    entryCount:  r.horses.length,
  }));
  res.json({ track: 'Saratoga Race Course', races: summary });
});

// GET /api/races/:number — full race card + analysis
router.get('/:number', (req, res) => {
  const num   = parseInt(req.params.number, 10);
  const track = req.query.condition || 'fast';
  const race  = RACES.find((r) => r.raceNumber === num);

  if (!race) {
    return res.status(404).json({ error: `Race ${num} not found` });
  }

  const analysis = analyseRace(race, track);
  const exotics  = exoticRecommendations(analysis.top3, race.horses);

  // Build side-by-side model table
  const modelTable = race.horses.map((h) => {
    const pn  = h.programNumber;
    const rankA = analysis.modelResults.A.findIndex((r) => r.horse.programNumber === pn) + 1;
    const rankB = analysis.modelResults.B.findIndex((r) => r.horse.programNumber === pn) + 1;
    const rankC = analysis.modelResults.C.findIndex((r) => r.horse.programNumber === pn) + 1;
    const dEntry = analysis.modelResults.D.find((r) => r.horse.programNumber === pn);
    const wEntry = analysis.modelResults.W
      ? analysis.modelResults.W.find((r) => r.horse.programNumber === pn)
      : null;

    return {
      programNumber: pn,
      name:          h.name,
      morningLine:   h.morningLine,
      jockey:        h.jockey,
      trainer:       h.trainer,
      postPosition:  h.postPosition,
      equipment:     h.equipment,
      daysOff:       h.daysOff,
      lastRaces:     h.lastRaces,
      paceRating:    h.paceRating,
      classRating:   h.classRating,
      wetRecord:     h.wetRecord,
      mudSire:       h.mudSire,
      rankA, rankB, rankC,
      scoreA:        analysis.modelResults.A[rankA - 1]?.score,
      scoreB:        analysis.modelResults.B[rankB - 1]?.score,
      scoreC:        analysis.modelResults.C[rankC - 1]?.score,
      roleC:         analysis.modelResults.C.find((r) => r.horse.programNumber === pn)?.role,
      dEdge:         dEntry?.edge,
      dIsOverlay:    dEntry?.isOverlay || false,
      dWinProb:      dEntry?.winProb,
      wetScore:      wEntry?.score,
      wetMudder:     wEntry?.mudder,
    };
  });

  res.json({
    race: {
      raceNumber:    race.raceNumber,
      date:          race.date,
      postTime:      race.postTime,
      distance:      race.distance,
      surface:       race.surface,
      raceType:      race.raceType,
      purse:         race.purse,
      claimingPrice: race.claimingPrice,
      ageRestriction: race.ageRestriction,
    },
    trackCondition: track,
    isOffTrack:     analysis.isOffTrack,
    modelTable,
    top3:           analysis.top3,
    exotics,
  });
});

module.exports = router;
