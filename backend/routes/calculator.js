const express    = require('express');
const router     = express.Router();
const { calculateBet, parseBet, slateSummary } = require('../utils/betCalculator');

// POST /api/calculator/bet
// Body: { stake, betType, horses: [1,2,3], payoutOdds? }
router.post('/bet', (req, res) => {
  const { stake, betType, horses, payoutOdds } = req.body;

  if (!betType || !horses || !Array.isArray(horses)) {
    return res.status(400).json({ error: 'stake, betType, and horses[] are required' });
  }

  const result = calculateBet(
    parseFloat(stake) || 2,
    betType,
    horses.map(Number),
    payoutOdds ? parseFloat(payoutOdds) : null
  );

  res.json(result);
});

// POST /api/calculator/parse
// Body: { betString: "$20 trifecta box 3-5-7" }
router.post('/parse', (req, res) => {
  const { betString } = req.body;
  if (!betString) return res.status(400).json({ error: 'betString is required' });

  const parsed = parseBet(betString);
  const result = calculateBet(parsed.stake, parsed.betType, parsed.horses);
  res.json({ parsed, result });
});

// POST /api/calculator/slate
// Body: { bets: [{ stake, betType, horses, payoutOdds? }, ...] }
router.post('/slate', (req, res) => {
  const { bets } = req.body;
  if (!bets || !Array.isArray(bets)) {
    return res.status(400).json({ error: 'bets[] array is required' });
  }
  res.json(slateSummary(bets));
});

module.exports = router;
