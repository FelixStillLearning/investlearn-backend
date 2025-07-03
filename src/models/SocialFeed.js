const mongoose = require('mongoose');

const socialFeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
  },
  type: {
    type: String,
    enum: ['portfolio_created', 'portfolio_updated', 'stock_bought', 'stock_sold', 'module_completed', 'badge_earned', 'achievement_earned'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SocialFeed', socialFeedSchema);