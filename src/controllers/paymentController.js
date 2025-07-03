const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const auditLogger = require('../utils/auditLogger');

// @desc    Create a Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      metadata: { userId: req.user.id },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Handle Stripe Webhook events
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then update your database, fulfill the order, etc.
      const userId = paymentIntent.metadata.userId;
      const amount = paymentIntent.amount / 100; // Convert back to dollars
      const currency = paymentIntent.currency.toUpperCase();

      try {
        // Create a transaction record
        const transaction = new Transaction({
          userId,
          type: 'deposit',
          amount,
          currency,
          status: 'completed',
          paymentMethod: { type: 'stripe', details: { paymentIntentId: paymentIntent.id } },
          total: amount, // For deposits, total is the amount
          description: `Stripe deposit: ${amount} ${currency}`,
        });
        await transaction.save();

        // Update user's wallet balance
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
          wallet = new Wallet({ userId });
        }
        wallet.balance += amount;
        wallet.totalDeposited += amount;
        await wallet.save();

        auditLogger(userId, 'deposit', 'Transaction', transaction._id, { amount, currency, paymentIntentId: paymentIntent.id }, req.ip);

      } catch (err) {
        console.error('Error processing payment_intent.succeeded:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      // ... handle other event types
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

// @desc    Initiate a withdrawal
// @route   POST /api/payments/withdraw
// @access  Private
exports.initiateWithdrawal = async (req, res) => {
  const { amount, method, details } = req.body;
  const userId = req.user.id;

  try {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance or wallet not found' });
    }

    // Create a pending transaction for withdrawal
    const transaction = new Transaction({
      userId,
      type: 'withdrawal',
      amount,
      currency: wallet.currency,
      status: 'pending',
      paymentMethod: { type: method, details },
      total: amount,
      description: `Withdrawal via ${method}`,
    });
    await transaction.save();

    // Deduct from wallet balance immediately
    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;
    await wallet.save();

    auditLogger(userId, 'withdrawal', 'Transaction', transaction._id, { amount, currency: wallet.currency, method }, req.ip);

    res.json({ msg: 'Withdrawal initiated successfully. It will be processed shortly.', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};