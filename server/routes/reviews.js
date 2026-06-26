const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');
const { requireFields, validateRating } = require('../middleware/validation');

const router = express.Router();

router.post('/', protect, requireFields(['sessionId', 'rating']), validateRating, async (req, res, next) => {
  try {
    const review = await store.createReview(req.user._id, req.body);
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

router.get('/session/:sessionId', protect, async (req, res, next) => {
  try {
    const reviews = await store.listSessionReviews(req.params.sessionId);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

router.put('/:reviewId', protect, validateRating, async (req, res, next) => {
  try {
    const review = await store.updateReview(req.params.reviewId, req.user._id, req.body);
    res.json({ review });
  } catch (error) {
    next(error);
  }
});

router.delete('/:reviewId', protect, async (req, res, next) => {
  try {
    await store.deleteReview(req.params.reviewId, req.user._id);
    res.json({ message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
