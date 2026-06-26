const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user1OffersSkill: { type: String, required: true },
    user1WantsSkill: { type: String, required: true },
    user2OffersSkill: { type: String, required: true },
    user2WantsSkill: { type: String, required: true },
    matchScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

matchSchema.index({ user1: 1, user2: 1 }, { unique: false });

module.exports = mongoose.model('Match', matchSchema);
