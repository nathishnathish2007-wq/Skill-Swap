const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const users = await store.getLeaderboard(req.query.sort || 'sessions');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
