const Wallet = require('../models/Wallet');
const User = require('../models/User');

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      // Create a new wallet if one doesn't exist for the user
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }

    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update wallet balance (internal use, e.g., after deposit/withdrawal)
// @route   PUT /api/wallet/update-balance
// @access  Private (Internal/Admin)
exports.updateBalance = async (req, res) => {
  try {
    const { userId, amount, type } = req.body; // type: 'deposit' or 'withdrawal'

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }

    if (type === 'deposit') {
      wallet.balance += amount;
      wallet.totalDeposited += amount;
    } else if (type === 'withdrawal') {
      if (wallet.balance < amount) {
        return res.status(400).json({ msg: 'Insufficient balance' });
      }
      wallet.balance -= amount;
      wallet.totalWithdrawn += amount;
    } else {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    await wallet.save();

    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
