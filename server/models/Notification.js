const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['MATCH_REQUEST', 'MATCH_ACCEPTED', 'MESSAGE', 'SESSION', 'REVIEW', 'BADGE_EARNED'],
      required: true
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
