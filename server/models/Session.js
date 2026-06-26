const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillFocus: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 15 },
    notes: { type: String, default: '' },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    googleMeetLink: { type: String, default: '' },
    zoomLink: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String },
    reminderSentAt1Hour: { type: Boolean, default: false },
    reminderSentAt1Day: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
