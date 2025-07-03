const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// @route   POST /api/payments/create-payment-intent
// @desc    Create a Stripe Payment Intent
// @access  Private
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);

// @route   POST /api/payments/webhook
// @desc    Stripe Webhook
// @access  Public
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.stripeWebhook);

// @route   POST /api/payments/withdraw
// @desc    Initiate a withdrawal
// @access  Private
router.post('/withdraw', auth, paymentController.initiateWithdrawal);

module.exports = router;
