const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      required: true
    }
  },
  { timestamps: false }
);

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    skill: { type: String },
    icon: { type: String, default: 'star' },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    college: { type: String, trim: true, default: '' },
    bio: { type: String, maxlength: 300, default: '' },
    avatar: { type: String, default: null },
    skillsOffered: [skillSchema],
    skillsWanted: [{ type: String, trim: true }],
    badges: [badgeSchema],
    totalSessions: { type: Number, default: 0 },
    totalSessionsAsTeacher: { type: Number, default: 0 },
    totalSessionsAsLearner: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  delete obj.password;
  obj._id = String(obj._id);
  return obj;
};

module.exports = mongoose.model('User', userSchema);
