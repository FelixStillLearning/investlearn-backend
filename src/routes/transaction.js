const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const transactionController = require('../controllers/transactionController');

// @route   POST api/transactions
// @desc    Create a transaction
// @access  Private
router.post(
  '/',
  [auth, [
    check('portfolioId', 'Portfolio ID is required').not().isEmpty(),
    check('type', 'Transaction type is required').not().isEmpty(),
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('total', 'Total is required and must be a number').isNumeric()
  ]],
  transactionController.createTransaction
);

// @route   GET api/transactions
// @desc    Get all transactions for a user (or specific portfolio)
// @access  Private
router.get('/', auth, transactionController.getTransactions);

// @route   GET api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, transactionController.getTransactionById);

// @route   PUT api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put(
  '/:id',
  [auth, [
    check('type', 'Transaction type is required').not().isEmpty(),
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('total', 'Total is required and must be a number').isNumeric()
  ]],
  transactionController.updateTransaction
);

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', auth, transactionController.deleteTransaction);

module.exports = router;
