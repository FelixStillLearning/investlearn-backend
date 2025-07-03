const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String, // e.g., FontAwesome class name or image URL
    required: true
  },
  criteria: {
    type: String, // Description of how to earn the badge
    required: true
  },
  rewardXp: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['learning', 'trading', 'social', 'challenge', 'other'],
    default: 'other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', badgeSchema);
