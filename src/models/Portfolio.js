const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['real', 'simulation', 'challenge'],
    default: 'simulation'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowCopy: {
      type: Boolean,
      default: false
    },
    riskLevel: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    }
  },
  performance: {
    totalValue: {
      type: Number,
      default: 0
    },
    totalInvested: {
      type: Number,
      default: 0
    },
    totalReturn: {
      type: Number,
      default: 0
    },
    returnPercentage: {
      type: Number,
      default: 0
    },
    dayChange: {
      type: Number,
      default: 0
    },
    dayChangePercentage: {
      type: Number,
      default: 0
    },
    volatility: {
      type: Number,
      default: 0
    },
    sharpeRatio: {
      type: Number,
      default: 0
    }
  },
  allocations: [{
    symbol: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    averagePrice: {
      type: Number,
      required: true
    },
    currentPrice: {
      type: Number,
      default: 0
    },
    marketValue: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    gainLoss: {
      type: Number,
      default: 0
    },
    gainLossPercentage: {
      type: Number,
      default: 0
    }
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
    totalValue: {
      type: Number,
      default: 0
    },
    dayChange: {
      type: Number,
      default: 0
    },
    dayChangePercentage: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` field on save
portfolioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
