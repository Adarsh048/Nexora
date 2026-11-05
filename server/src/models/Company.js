import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logo: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    default: 'Technology',
  },
  location: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  recruiterContacts: [{
    name: { type: String, required: true },
    email: { type: String, default: '' },
    role: { type: String, default: 'Recruiter' },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  }],
}, {
  timestamps: true,
});

companySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Company', companySchema);

