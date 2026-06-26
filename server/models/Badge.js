const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'star' },
    skill: { type: String },
    requirements: {
      minSessions: { type: Number, default: 0 },
      minRating: { type: Number, default: 0 },
      minSessionsAsTeacher: { type: Number, default: 0 },
      minSessionsAsLearner: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
