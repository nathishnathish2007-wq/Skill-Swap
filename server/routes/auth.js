const express = require('express');
const store = require('../data/store');
const { protect, signToken } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validation');

const router = express.Router();

router.post('/register', requireFields(['name', 'email', 'password']), async (req, res, next) => {
  try {
    const user = await store.createUser(req.body);
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', requireFields(['email', 'password']), async (req, res, next) => {
  try {
    const user = await store.authenticateUser(req.body.email, req.body.password);
    const token = signToken(user);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', protect, async (req, res, next) => {
  try {
    await store.updateUser(req.user._id, { isOnline: false });
    res.json({ message: 'Logged out.' });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', protect, async (req, res) => {
  res.json({ token: signToken(req.user), user: req.user });
});

router.post('/reset-password', requireFields(['email']), async (req, res) => {
  res.json({ message: 'If this email exists, a reset link will be sent.' });
});

router.post('/verify-email', protect, async (req, res) => {
  res.json({ message: 'Email verification endpoint ready for provider integration.' });
});

module.exports = router;
