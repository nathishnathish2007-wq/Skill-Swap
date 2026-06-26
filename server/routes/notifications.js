const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await store.listNotifications(req.user._id);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

router.put('/:notificationId/read', protect, async (req, res, next) => {
  try {
    const notification = await store.markNotificationRead(req.params.notificationId, req.user._id);
    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
