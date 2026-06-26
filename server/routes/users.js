const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/browse', protect, async (req, res, next) => {
  try {
    const users = await store.listUsers({ ...req.query, excludeUserId: req.user._id });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId/reviews', protect, async (req, res, next) => {
  try {
    const reviews = await store.listUserReviews(req.params.userId);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', protect, async (req, res, next) => {
  try {
    const user = await store.getUserById(req.params.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.status = 404;
      throw error;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/:userId', protect, async (req, res, next) => {
  try {
    if (String(req.params.userId) !== String(req.user._id)) {
      const error = new Error('You can only update your own profile.');
      error.status = 403;
      throw error;
    }
    const user = await store.updateUser(req.params.userId, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId', protect, async (req, res, next) => {
  try {
    if (String(req.params.userId) !== String(req.user._id)) {
      const error = new Error('You can only delete your own profile.');
      error.status = 403;
      throw error;
    }
    await store.deleteUser(req.params.userId);
    res.json({ message: 'Profile deleted.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/skills', protect, async (req, res, next) => {
  try {
    if (String(req.params.userId) !== String(req.user._id)) {
      const error = new Error('You can only edit your own skills.');
      error.status = 403;
      throw error;
    }
    const user = await store.addSkill(req.params.userId, req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId/skills/:skillId', protect, async (req, res, next) => {
  try {
    if (String(req.params.userId) !== String(req.user._id)) {
      const error = new Error('You can only edit your own skills.');
      error.status = 403;
      throw error;
    }
    const user = await store.removeSkill(req.params.userId, req.params.skillId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    const users = await store.listUsers({ ...req.query, excludeUserId: req.user._id });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
