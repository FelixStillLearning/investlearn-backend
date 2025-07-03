const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const walletController = require('../controllers/walletController');

// @route   GET api/wallet
// @desc    Get user wallet
// @access  Private
router.get('/', auth, walletController.getWallet);

// @route   PUT api/wallet/update-balance
// @desc    Update wallet balance (internal use)
// @access  Private (Admin/Internal)
router.put('/update-balance', auth, walletController.updateBalance);

module.exports = router;
