const MarketData = require('../models/MarketData');
const marketDataService = require('../utils/marketDataService');
const io = require('../server').io;

// Redis setup with fallback
let redisClient = null;
if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', (err) => {
      console.log('Redis error:', err);
      redisClient = null; // Disable Redis on error
    });
  } catch (err) {
    console.log('Redis connection failed, running without cache');
    redisClient = null;
  }
}

// @desc    Get market data for a symbol
// @route   GET /api/marketdata/:symbol
// @access  Public
exports.getMarketData = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // Try to get data from Redis cache first (if available)
    if (redisClient) {
      try {
        const cachedData = await redisClient.get(`marketData:${symbol}`);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      } catch (err) {
        console.log('Redis get error:', err);
      }
    }

    let marketData = await MarketData.findOne({ symbol });

    if (!marketData || (Date.now() - marketData.lastUpdated) > 3600000) { // 1 hour cache
      const fetchedData = await marketDataService.getStockData(symbol);
      if (fetchedData) {
        if (marketData) {
          marketData.currentPrice = fetchedData.price;
          marketData.lastUpdated = Date.now();
        } else {
          marketData = new MarketData({
            symbol: fetchedData.symbol,
            name: fetchedData.symbol, // Placeholder
            currentPrice: fetchedData.price,
          });
        }
        await marketData.save();
        
        // Store in Redis cache (if available)
        if (redisClient) {
          try {
            await redisClient.set(`marketData:${symbol}`, JSON.stringify(marketData), 'EX', 3600); // Cache for 1 hour
          } catch (err) {
            console.log('Redis set error:', err);
          }
        }
        
        io.emit('market_data_update', marketData);
      } else if (!marketData) {
        return res.status(404).json({ msg: 'Market data not found for this symbol' });
      }
    }

    res.json(marketData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Search for stocks/assets
// @route   GET /api/marketdata/search
// @access  Public
exports.searchMarketData = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    const results = await MarketData.find({
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};