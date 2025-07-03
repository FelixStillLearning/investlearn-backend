const mongoose = require('mongoose');

const learningModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['basics', 'stocks', 'bonds', 'crypto', 'advanced'],
    default: 'basics'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  prerequisites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule'
    }
  ],
  content: {
    introduction: {
      type: String
    },
    sections: [
      {
        title: {
          type: String,
          required: true
        },
        content: {
          type: String, // markdown/html
          required: true
        },
        mediaType: {
          type: String,
          enum: ['text', 'video', 'interactive']
        },
        mediaUrl: {
          type: String
        },
        quiz: [
          {
            question: {
              type: String,
              required: true
            },
            options: {
              type: [String],
              required: true
            },
            correctAnswer: {
              type: Number, // index of the correct option
              required: true
            },
            explanation: {
              type: String
            }
          }
        ]
      }
    ]
  },
  rewards: {
    xp: {
      type: Number,
      default: 0
    },
    badges: [
      {
        type: String
      }
    ],
    simulationCredits: {
      type: Number,
      default: 0
    }
  },
  stats: {
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  },
  tags: [
    {
      type: String
    }
  ],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
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
learningModuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LearningModule', learningModuleSchema);
