import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null,
  },
  companyName: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  eventType: {
    type: String,
    enum: ['Interview', 'Assessment Deadline', 'Recruiter Call', 'Follow-up', 'Offer Decision', 'Other'],
    default: 'Interview',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    default: 'Google Meet / Zoom',
  },
  meetingLink: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  reminderMinutes: {
    type: Number,
    default: 30,
  },
}, {
  timestamps: true,
});

calendarEventSchema.index({ userId: 1, startTime: 1 });

export default mongoose.model('CalendarEvent', calendarEventSchema);

