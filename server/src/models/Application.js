import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  companyLogo: {
    type: String,
    default: '',
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
  },
  jobDescription: {
    type: String,
    default: '',
  },
  jobLocation: {
    type: String,
    default: 'Remote',
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Contract', 'Part-time', 'Co-op', 'Other'],
    default: 'Full-time',
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    default: 'LinkedIn',
  },
  originalUrl: {
    type: String,
    default: '',
  },
  portalUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'On Hold'],
    default: 'Applied',
    index: true,
  },
  recruiterName: {
    type: String,
    default: '',
  },
  recruiterEmail: {
    type: String,
    default: '',
  },
  salaryRange: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  followUpDate: {
    type: Date,
    default: null,
  },
  assessmentDeadline: {
    type: Date,
    default: null,
  },
  interviewDate: {
    type: Date,
    default: null,
  },
  kanbanOrder: {
    type: Number,
    default: 0,
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, companyName: 1 });
applicationSchema.index({ userId: 1, appliedDate: -1 });

export default mongoose.model('Application', applicationSchema);

