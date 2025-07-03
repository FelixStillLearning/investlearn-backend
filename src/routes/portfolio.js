const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const portfolioController = require('../controllers/portfolioController');

// @route   POST api/portfolios
// @desc    Create a portfolio
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  portfolioController.createPortfolio
);

// @route   GET api/portfolios
// @desc    Get all portfolios for a user
// @access  Private
router.get('/', auth, portfolioController.getPortfolios);

// @route   GET api/portfolios/:id
// @desc    Get portfolio by ID
// @access  Private
router.get('/:id', auth, portfolioController.getPortfolioById);

// @route   PUT api/portfolios/:id
// @desc    Update portfolio
// @access  Private
router.put(
  '/:id',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  portfolioController.updatePortfolio
);

// @route   DELETE api/portfolios/:id
// @desc    Delete portfolio
// @access  Private
router.delete('/:id', auth, portfolioController.deletePortfolio);

// @route   POST api/portfolios/:id/buy
// @desc    Buy stock
// @access  Private
router.post(
  '/:id/buy',
  [auth, [
    check('symbol', 'Symbol is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number').isNumeric()
  ]],
  portfolioController.buyStock
);

// @route   POST api/portfolios/:id/sell
// @desc    Sell stock
// @access  Private
router.post(
  '/:id/sell',
  [auth, [
    check('symbol', 'Symbol is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number').isNumeric()
  ]],
  portfolioController.sellStock
);

router.post(
  '/:id/copy',
  auth,
  portfolioController.copyPortfolio
);

module.exports = router;
