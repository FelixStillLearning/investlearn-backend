
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    dateOfBirth: { type: Date },
    country: { type: String, default: '' },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    investmentGoals: [String],
    riskAssessmentScore: { type: Number, default: 0 }, // New field
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['id', 'passport', 'driver_license'],
        },
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  gamification: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    badges: [String],
    achievements: [String],
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActivity: { type: Date },
    },
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningModule',
      },
    ],
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketUpdates: { type: Boolean, default: true },
      portfolioAlerts: { type: Boolean, default: true },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
      portfolioVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
    },
    tradingMode: {
      type: String,
      enum: ['real', 'simulation'],
      default: 'simulation',
    },
  },
  wallet: {
    balance: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
