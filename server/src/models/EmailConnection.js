import mongoose from 'mongoose';

const emailConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    default: 'gmail',
  },
  connected: {
    type: Boolean,
    default: true,
  },
  accessTokenEncrypted: {
    type: String,
    default: null,
  },
  refreshTokenEncrypted: {
    type: String,
    default: null,
  },
  tokenExpiry: {
    type: Date,
    default: null,
  },
  lastSyncedAt: {
    type: Date,
    default: null,
  },
  historyId: {
    type: String,
    default: null,
  },
  monitoringActive: {
    type: Boolean,
    default: false,
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'success', 'error'],
    default: 'idle',
  },
  errorMessage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('EmailConnection', emailConnectionSchema);

