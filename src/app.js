
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression Middleware
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Simple route for testing
app.get('/', (req, res) => {
  res.send('InvestLearn API is running...');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'InvestLearn API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    endpoints: {
      auth: '/api/auth',
      portfolios: '/api/portfolios', 
      transactions: '/api/transactions',
      marketdata: '/api/marketdata',
      learningmodules: '/api/learningmodules',
      badges: '/api/badges',
      gamification: '/api/gamification'
    }
  });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolios', require('./routes/portfolio'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/marketdata', require('./routes/marketdata'));
app.use('/api/learningmodules', require('./routes/learningModule'));
app.use('/api/badges', require('./routes/badge'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/social', require('./routes/social'));
app.use('/api/challenges', require('./routes/challenge'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/risk-assessment', require('./routes/riskAssessment'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/users', require('./routes/user'));
app.use('/api/comments', require('./routes/comment'));

module.exports = app;
