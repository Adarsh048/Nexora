import mongoose from 'mongoose';

const applicationEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: [
      'Application Submitted',
      'Confirmation Received',
      'Assessment Invitation',
      'Assessment Completed',
      'Interview Scheduled',
      'Interview Completed',
      'Offer Received',
      'Rejection Received',
      'Status Changed',
      'Follow-up Sent',
      'Note Added'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'gmail', 'email', 'csv', 'system'],
    default: 'manual',
  },
  previousStatus: {
    type: String,
    default: null,
  },
  newStatus: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  emailReferenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessedEmail',
    default: null,
  },
}, {
  timestamps: true,
});

applicationEventSchema.index({ userId: 1, eventDate: -1 });
applicationEventSchema.index({ applicationId: 1, eventDate: -1 });

export default mongoose.model('ApplicationEvent', applicationEventSchema);

