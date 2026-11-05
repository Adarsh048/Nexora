import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  badgeKey: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'award',
  },
  category: {
    type: String,
    enum: ['milestone', 'streak', 'application', 'interview', 'offer'],
    default: 'milestone',
  },
  unlocked: {
    type: Boolean,
    default: false,
  },
  unlockedAt: {
    type: Date,
    default: null,
  },
  progress: {
    type: Number,
    default: 0,
  },
  maxProgress: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

achievementSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

export default mongoose.model('Achievement', achievementSchema);

