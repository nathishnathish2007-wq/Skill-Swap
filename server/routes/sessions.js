const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validation');

const router = express.Router();

router.post('/', protect, requireFields(['matchId', 'skillFocus', 'scheduledDate', 'scheduledTime']), async (req, res, next) => {
  try {
    const session = await store.createSession(req.user._id, req.body);
    req.app.get('io')?.to(req.body.matchId).emit('sessionScheduled', session);
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

router.get('/my-sessions', protect, async (req, res, next) => {
  try {
    const sessions = await store.listSessions(req.user._id, req.query.type);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.get('/upcoming', protect, async (req, res, next) => {
  try {
    const sessions = await store.listSessions(req.user._id, 'upcoming');
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.get('/past', protect, async (req, res, next) => {
  try {
    const sessions = await store.listSessions(req.user._id, 'past');
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId/reviews', protect, async (req, res, next) => {
  try {
    const reviews = await store.listSessionReviews(req.params.sessionId);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId', protect, async (req, res, next) => {
  try {
    const session = await store.getSessionById(req.params.sessionId, req.user._id);
    if (!session) {
      const error = new Error('Session not found.');
      error.status = 404;
      throw error;
    }
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

router.put('/:sessionId', protect, async (req, res, next) => {
  try {
    const session = await store.updateSession(req.params.sessionId, req.user._id, req.body);
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

router.put('/:sessionId/complete', protect, async (req, res, next) => {
  try {
    const session = await store.completeSession(req.params.sessionId, req.user._id);
    req.app.get('io')?.to(session.matchId).emit('sessionCompleted', session);
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

router.delete('/:sessionId', protect, async (req, res, next) => {
  try {
    const session = await store.cancelSession(req.params.sessionId, req.user._id, req.body?.cancellationReason);
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
