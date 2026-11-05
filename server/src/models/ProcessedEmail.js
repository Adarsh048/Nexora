import mongoose from 'mongoose';

const processedEmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  emailConnectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailConnection',
  },
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  threadId: {
    type: String,
    default: '',
  },
  senderName: {
    type: String,
    default: '',
  },
  senderEmail: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
    default: '',
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  detectedCategory: {
    type: String,
    enum: [
      'Confirmation',
      'Assessment',
      'Interview',
      'Offer',
      'Rejection',
      'Recruiter Communication',
      'Other'
    ],
    default: 'Other',
    index: true,
  },
  suggestedStatus: {
    type: String,
    enum: ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', null],
    default: null,
  },
  detectedCompany: {
    type: String,
    default: '',
  },
  detectedJobTitle: {
    type: String,
    default: '',
  },
  matchConfidence: {
    type: Number, // 0 to 100
    default: 0,
  },
  matchedApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null,
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'dismissed'],
    default: 'pending',
    index: true,
  },
  appliedToTimeline: {
    type: Boolean,
    default: false,
  },
  actionTakenAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

processedEmailSchema.index({ userId: 1, messageId: 1 }, { unique: true });
processedEmailSchema.index({ userId: 1, reviewStatus: 1 });
processedEmailSchema.index({ userId: 1, receivedAt: -1 });

export default mongoose.model('ProcessedEmail', processedEmailSchema);

