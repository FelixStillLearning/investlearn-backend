const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['portfolio_performance', 'trading', 'prediction', 'knowledge'],
    default: 'portfolio_performance'
  },
  rules: {
    duration: {
      type: Number, // in days
      required: true
    },
    startingCapital: {
      type: Number,
      required: true
    },
    allowedAssets: [
      {
        type: String
      }
    ],
    maxPositions: {
      type: Number
    },
    tradingFees: {
      type: Number,
      default: 0
    }
  },
  rewards: {
    winner: {
      xp: {
        type: Number,
        default: 0
      },
      badges: [
        {
          type: String
        }
      ],
      cash: {
        type: Number,
        default: 0
      }
    },
    participation: {
      xp: {
        type: Number,
        default: 0
      },
      badges: [
        {
          type: String
        }
      ]
    }
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      finalPerformance: {
        rank: Number,
        return: Number,
        returnPercentage: Number
      }
    }
  ],
  leaderboard: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      username: {
        type: String,
        required: true
      },
      return: {
        type: Number,
        default: 0
      },
      returnPercentage: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number
      }
    }
  ],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  history: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      leaderboardSnapshot: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
          },
          username: {
            type: String,
            required: true
          },
          return: {
            type: Number,
            default: 0
          },
          returnPercentage: {
            type: Number,
            default: 0
          },
          rank: {
            type: Number
          }
        }
      ],
      // You can add other key performance indicators here if needed
      // e.g., totalParticipants: Number, averageReturn: Number
    }
  ]
});

// Update `updatedAt` field on save
challengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
