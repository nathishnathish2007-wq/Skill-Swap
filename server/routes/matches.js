const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validation');

const router = express.Router();

router.get('/recommendations', protect, async (req, res, next) => {
  try {
    const recommendations = await store.getRecommendations(req.user._id, req.query);
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
});

router.get('/my-matches', protect, async (req, res, next) => {
  try {
    const matches = await store.listUserMatches(req.user._id, req.query);
    res.json({ matches });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, requireFields(['partnerId']), async (req, res, next) => {
  try {
    const match = await store.createMatch(req.user._id, req.body.partnerId);
    res.status(201).json({ match });
  } catch (error) {
    next(error);
  }
});

router.get('/:matchId/details', protect, async (req, res, next) => {
  try {
    const match = await store.getMatchById(req.params.matchId, req.user._id);
    if (!match) {
      const error = new Error('Match not found.');
      error.status = 404;
      throw error;
    }
    res.json({ match });
  } catch (error) {
    next(error);
  }
});

router.put('/:matchId/accept', protect, async (req, res, next) => {
  try {
    const match = await store.updateMatchStatus(req.params.matchId, req.user._id, 'accepted');
    res.json({ match });
  } catch (error) {
    next(error);
  }
});

router.put('/:matchId/reject', protect, async (req, res, next) => {
  try {
    const match = await store.updateMatchStatus(req.params.matchId, req.user._id, 'rejected');
    res.json({ match });
  } catch (error) {
    next(error);
  }
});

router.delete('/:matchId', protect, async (req, res, next) => {
  try {
    await store.deleteMatch(req.params.matchId, req.user._id);
    res.json({ message: 'Match removed.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
