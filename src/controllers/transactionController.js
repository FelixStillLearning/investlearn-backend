const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const io = require('../server').io; // Import the Socket.io instance

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { portfolioId, type, symbol, quantity, price, amount, currency, fees, total, status, paymentMethod, relatedPortfolio, relatedTransaction, metadata, description } = req.body;

    // Basic validation
    if (!portfolioId || !type || !amount || !total) {
      return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    // Ensure user owns the portfolio
    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to add transactions to this portfolio' });
    }

    const newTransaction = new Transaction({
      userId: req.user.id,
      portfolioId,
      type,
      symbol,
      quantity,
      price,
      amount,
      currency,
      fees,
      total,
      status,
      paymentMethod,
      relatedPortfolio,
      relatedTransaction,
      metadata,
      description
    });

    const transaction = await newTransaction.save();
    res.status(201).json(transaction);
    io.to(portfolioId).emit('new_transaction', transaction); // Emit to portfolio room
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all transactions for a user (or specific portfolio)
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { portfolioId } = req.query;
    let query = { userId: req.user.id };

    if (portfolioId) {
      query.portfolioId = portfolioId;
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    const { type, symbol, quantity, price, amount, currency, fees, total, status, paymentMethod, relatedPortfolio, relatedTransaction, metadata, description } = req.body;

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const transactionFields = {};
    if (type) transactionFields.type = type;
    if (symbol) transactionFields.symbol = symbol;
    if (quantity) transactionFields.quantity = quantity;
    if (price) transactionFields.price = price;
    if (amount) transactionFields.amount = amount;
    if (currency) transactionFields.currency = currency;
    if (fees) transactionFields.fees = fees;
    if (total) transactionFields.total = total;
    if (status) transactionFields.status = status;
    if (paymentMethod) transactionFields.paymentMethod = paymentMethod;
    if (relatedPortfolio) transactionFields.relatedPortfolio = relatedPortfolio;
    if (relatedTransaction) transactionFields.relatedTransaction = relatedTransaction;
    if (metadata) transactionFields.metadata = metadata;
    if (description) transactionFields.description = description;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: transactionFields },
      { new: true }
    );

    res.json(transaction);
    io.to(transaction.portfolioId).emit('transaction_update', transaction); // Emit to portfolio room
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Make sure user owns transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Transaction removed' });
    io.to(transaction.portfolioId).emit('transaction_delete', transaction._id); // Emit to portfolio room
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
};