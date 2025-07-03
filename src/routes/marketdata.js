const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');

// @route   GET api/marketdata/:symbol
// @desc    Get market data for a specific symbol
// @access  Public
router.get('/:symbol', marketDataController.getMarketData);

// @route   GET api/marketdata/search
// @desc    Search for stocks/assets
// @access  Public
router.get('/search', marketDataController.searchMarketData);

module.exports = router;
