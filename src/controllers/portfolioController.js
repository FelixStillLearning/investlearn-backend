const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const MarketData = require('../models/MarketData');
const auditLogger = require('../utils/auditLogger');
const { createSocialFeedEntry } = require('./socialController');
const io = require('../server').io; // Import the Socket.io instance

// @desc    Create new portfolio
// @route   POST /api/portfolios
// @access  Private
exports.createPortfolio = async (req, res) => {
  try {
    const { name, description, type, settings } = req.body;

    // Check if user exists (though auth middleware should handle this)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newPortfolio = new Portfolio({
      userId: req.user.id,
      name,
      description,
      type,
      settings
    });

    const portfolio = await newPortfolio.save();
    res.status(201).json(portfolio);
    auditLogger(req.user.id, 'create_portfolio', 'Portfolio', portfolio._id, { name, type }, req.ip);
    createSocialFeedEntry(req.user.id, 'portfolio_created', `created a new portfolio: ${portfolio.name}`, portfolio._id);
    io.emit('portfolio_update', portfolio); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all portfolios for a user
// @route   GET /api/portfolios
// @access  Private
exports.getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Make sure user owns portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update portfolio
// @route   PUT /api/portfolios/:id
// @access  Private
exports.updatePortfolio = async (req, res) => {
  try {
    const { name, description, type, status, settings } = req.body;

    let portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Make sure user owns portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Build portfolio object
    const portfolioFields = {};
    if (name) portfolioFields.name = name;
    if (description) portfolioFields.description = description;
    if (type) portfolioFields.type = type;
    if (status) portfolioFields.status = status;
    if (settings) portfolioFields.settings = settings;

    portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      { $set: portfolioFields },
      { new: true }
    );

    res.json(portfolio);
    auditLogger(req.user.id, 'update_portfolio', 'Portfolio', portfolio._id, { updatedFields: Object.keys(portfolioFields) }, req.ip);
    createSocialFeedEntry(req.user.id, 'portfolio_updated', `updated portfolio: ${portfolio.name}`, portfolio._id);
    io.emit('portfolio_update', portfolio); // Emit update
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Make sure user owns portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Portfolio removed' });
    auditLogger(req.user.id, 'delete_portfolio', 'Portfolio', portfolio._id, { name: portfolio.name }, req.ip);
    io.emit('portfolio_delete', portfolio._id); // Emit delete
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Buy stock
// @route   POST /api/portfolios/:id/buy
// @access  Private
exports.buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const portfolioId = req.params.id;

    let portfolio = await Portfolio.findById(portfolioId);

    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const marketData = await MarketData.findOne({ symbol: symbol.toUpperCase() });
    if (!marketData) {
      return res.status(404).json({ msg: 'Stock not found in market data' });
    }

    const currentPrice = marketData.currentPrice;
    const totalCost = currentPrice * quantity;

    // Check if portfolio has enough balance (for real or simulation)
    // For now, assuming simulation and unlimited funds. Will add wallet check later.

    // Add to allocations
    const existingAllocationIndex = portfolio.allocations.findIndex(alloc => alloc.symbol === symbol.toUpperCase());

    if (existingAllocationIndex !== -1) {
      const existingAllocation = portfolio.allocations[existingAllocationIndex];
      const newTotalQuantity = existingAllocation.quantity + quantity;
      const newTotalCost = (existingAllocation.averagePrice * existingAllocation.quantity) + totalCost;
      existingAllocation.averagePrice = newTotalCost / newTotalQuantity;
      existingAllocation.quantity = newTotalQuantity;
      existingAllocation.currentPrice = currentPrice;
      existingAllocation.marketValue = newTotalQuantity * currentPrice;
      existingAllocation.gainLoss = existingAllocation.marketValue - (existingAllocation.averagePrice * existingAllocation.quantity);
      existingAllocation.gainLossPercentage = (existingAllocation.gainLoss / (existingAllocation.averagePrice * existingAllocation.quantity)) * 100;
    } else {
      portfolio.allocations.push({
        symbol: symbol.toUpperCase(),
        name: marketData.name,
        quantity,
        averagePrice: currentPrice,
        currentPrice,
        marketValue: totalCost,
        percentage: 0, // Will calculate later
        gainLoss: 0,
        gainLossPercentage: 0,
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      portfolioId,
      type: 'buy',
      symbol: symbol.toUpperCase(),
      quantity,
      price: currentPrice,
      amount: totalCost,
      total: totalCost,
      description: `Bought ${quantity} shares of ${symbol.toUpperCase()} at $${currentPrice}`,
    });
    await transaction.save();
    portfolio.transactions.push(transaction._id); // Store transaction ID in portfolio

    portfolio.performance.totalReturn = portfolio.performance.totalValue - portfolio.performance.totalInvested;
    portfolio.performance.returnPercentage = (portfolio.performance.totalReturn / portfolio.performance.totalInvested) * 100;
    portfolio.performance.dayChange = 0; // Placeholder
    portfolio.performance.dayChangePercentage = 0; // Placeholder

    await portfolio.save();

    res.json(portfolio);
    auditLogger(req.user.id, 'buy_stock', 'Portfolio', portfolio._id, { symbol, quantity, price: currentPrice, totalCost }, req.ip);
    createSocialFeedEntry(req.user.id, 'stock_bought', `bought ${quantity} shares of ${symbol} for ${portfolio.name}`, portfolio._id);
    io.emit('portfolio_update', portfolio); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Sell stock
// @route   POST /api/portfolios/:id/sell
// @access  Private
exports.sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const portfolioId = req.params.id;

    let portfolio = await Portfolio.findById(portfolioId);

    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const existingAllocationIndex = portfolio.allocations.findIndex(alloc => alloc.symbol === symbol.toUpperCase());

    if (existingAllocationIndex === -1) {
      return res.status(404).json({ msg: 'Stock not found in portfolio allocations' });
    }

    const existingAllocation = portfolio.allocations[existingAllocationIndex];

    if (existingAllocation.quantity < quantity) {
      return res.status(400).json({ msg: 'Not enough shares to sell' });
    }

    const marketData = await MarketData.findOne({ symbol: symbol.toUpperCase() });
    if (!marketData) {
      return res.status(404).json({ msg: 'Stock not found in market data' });
    }

    const currentPrice = marketData.currentPrice;
    const totalSaleValue = currentPrice * quantity;

    // Update allocations
    existingAllocation.quantity -= quantity;
    existingAllocation.marketValue = existingAllocation.quantity * currentPrice;
    existingAllocation.gainLoss = existingAllocation.marketValue - (existingAllocation.averagePrice * existingAllocation.quantity);
    existingAllocation.gainLossPercentage = (existingAllocation.gainLoss / (existingAllocation.averagePrice * existingAllocation.quantity)) * 100;

    if (existingAllocation.quantity === 0) {
      portfolio.allocations.splice(existingAllocationIndex, 1); // Remove if quantity is 0
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      portfolioId,
      type: 'sell',
      symbol: symbol.toUpperCase(),
      quantity,
      price: currentPrice,
      amount: totalSaleValue,
      total: totalSaleValue,
      description: `Sold ${quantity} shares of ${symbol.toUpperCase()} at $${currentPrice}`,
    });
    await transaction.save();
    portfolio.transactions.push(transaction._id); // Store transaction ID in portfolio

    portfolio.performance.totalReturn = portfolio.performance.totalValue - portfolio.performance.totalInvested;
    portfolio.performance.returnPercentage = (portfolio.performance.totalReturn / portfolio.performance.totalInvested) * 100;
    portfolio.performance.dayChange = 0; // Placeholder
    portfolio.performance.dayChangePercentage = 0; // Placeholder

    await portfolio.save();

    res.json(portfolio);
    auditLogger(req.user.id, 'sell_stock', 'Portfolio', portfolio._id, { symbol, quantity, price: currentPrice, totalSaleValue }, req.ip);
    createSocialFeedEntry(req.user.id, 'stock_sold', `sold ${quantity} shares of ${symbol} from ${portfolio.name}`, portfolio._id);
    io.emit('portfolio_update', portfolio); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Copy a portfolio
// @route   POST /api/portfolios/:id/copy
// @access  Private
exports.copyPortfolio = async (req, res) => {
  try {
    const sourcePortfolioId = req.params.id;
    const currentUserId = req.user.id;

    const sourcePortfolio = await Portfolio.findById(sourcePortfolioId);

    if (!sourcePortfolio) {
      return res.status(404).json({ msg: 'Source portfolio not found' });
    }

    // Ensure the source portfolio is public or owned by the current user
    if (!sourcePortfolio.settings.isPublic && sourcePortfolio.userId.toString() !== currentUserId) {
      return res.status(401).json({ msg: 'You are not authorized to copy this portfolio' });
    }

    // Create a new portfolio based on the source
    const newPortfolio = new Portfolio({
      userId: currentUserId,
      name: `Copy of ${sourcePortfolio.name}`,
      description: `Copied from ${sourcePortfolio.name} (${sourcePortfolio.userId})`,
      type: 'simulation', // Copied portfolios are always simulations initially
      status: 'active',
      settings: {
        isPublic: false, // Copied portfolios are private by default
        allowCopy: false,
        riskLevel: sourcePortfolio.settings.riskLevel,
      },
      performance: { ...sourcePortfolio.performance },
      allocations: sourcePortfolio.allocations.map(alloc => ({ ...alloc._doc })), // Deep copy allocations
      transactions: [], // Start with no transactions for copied portfolio
      history: [], // Start with no history for copied portfolio
    });

    const portfolio = await newPortfolio.save();

    res.status(201).json(portfolio);
    auditLogger(req.user.id, 'copy_portfolio', 'Portfolio', portfolio._id, { sourcePortfolioId, newPortfolioName: portfolio.name }, req.ip);
    createSocialFeedEntry(req.user.id, 'portfolio_created', `copied portfolio: ${portfolio.name}`, portfolio._id);
    io.emit('portfolio_update', portfolio); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
