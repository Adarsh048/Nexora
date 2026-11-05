import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  googleId: {
    type: String,
    sparse: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  careerGoal: {
    type: String,
    default: 'Get your next offer',
  },
  targetRole: {
    type: String,
    default: 'Software Engineer',
  },
  weeklyGoal: {
    type: Number,
    default: 5,
    min: 1,
    max: 50,
  },
  streak: {
    current: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    activeDays: {
      type: [String], // Array of 'YYYY-MM-DD'
      default: [],
    },
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    calendarSync: { type: Boolean, default: true },
    theme: { type: String, default: 'light' },
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

