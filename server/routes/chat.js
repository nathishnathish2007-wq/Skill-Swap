const express = require('express');
const store = require('../data/store');
const { protect } = require('../middleware/authMiddleware');
const { requireFields } = require('../middleware/validation');

const router = express.Router();

router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const unreadCount = await store.getUnreadCount(req.user._id);
    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
});

router.get('/:matchId/messages', protect, async (req, res, next) => {
  try {
    const messages = await store.listMessages(req.params.matchId, req.user._id, req.query);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

router.post('/:matchId/message', protect, requireFields(['content']), async (req, res, next) => {
  try {
    const message = await store.createMessage(req.params.matchId, req.user._id, req.body.content, req.body.attachments);
    req.app.get('io')?.to(req.params.matchId).emit('receiveMessage', message);
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.put('/:messageId/read', protect, async (req, res, next) => {
  try {
    const message = await store.markMessageRead(req.params.messageId, req.user._id);
    res.json({ message });
  } catch (error) {
    next(error);
  }
});

router.delete('/:messageId', protect, async (req, res, next) => {
  try {
    await store.deleteMessage(req.params.messageId, req.user._id);
    res.json({ message: 'Message deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
