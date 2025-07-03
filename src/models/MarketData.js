const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  exchange: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  marketCap: {
    type: Number
  },
  currentPrice: {
    type: Number,
    required: true
  },
  dayChange: {
    type: Number,
    default: 0
  },
  dayChangePercentage: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number
  },
  averageVolume: {
    type: Number
  },
  peRatio: {
    type: Number
  },
  dividendYield: {
    type: Number
  },
  weekHigh52: {
    type: Number
  },
  weekLow52: {
    type: Number
  },
  beta: {
    type: Number
  },
  eps: {
    type: Number
  },
  priceHistory: [
    {
      date: {
        type: Date,
        required: true
      },
      open: {
        type: Number,
        required: true
      },
      high: {
        type: Number,
        required: true
      },
      low: {
        type: Number,
        required: true
      },
      close: {
        type: Number,
        required: true
      },
      volume: {
        type: Number,
        required: true
      }
    }
  ],
  fundamentals: {
    revenue: Number,
    netIncome: Number,
    totalAssets: Number,
    totalDebt: Number,
    returnOnEquity: Number,
    returnOnAssets: Number,
    profitMargin: Number
  },
  news: [
    {
      title: String,
      summary: String,
      url: String,
      publishedAt: Date,
      sentiment: {
        type: String,
        enum: ['positive', 'negative', 'neutral']
      }
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update `lastUpdated` field on save
marketDataSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('MarketData', marketDataSchema);
