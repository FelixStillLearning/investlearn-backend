
const express = require('express');
const router = express.Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public

const { register, login, getLoggedInUser } = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, getLoggedInUser);

// @route   PUT api/auth/toggle-trading-mode
// @desc    Toggle user trading mode (real/simulation)
// @access  Private
router.put('/toggle-trading-mode', auth, userController.toggleTradingMode);


module.exports = router;
