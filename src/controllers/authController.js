const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auditLogger = require('../utils/auditLogger');
const io = require('../server').io; // Import the Socket.io instance

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
        auditLogger(user.id, 'register', 'User', user._id, { email: user.email, username: user.username }, req.ip);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
        auditLogger(user.id, 'login', 'User', user._id, { email: user.email }, req.ip);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Toggle user trading mode (real/simulation)
// @route   PUT /api/auth/toggle-trading-mode
// @access  Private
exports.toggleTradingMode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.settings.tradingMode = user.settings.tradingMode === 'real' ? 'simulation' : 'real';
    await user.save();

    res.json({ msg: `Trading mode set to ${user.settings.tradingMode}`, tradingMode: user.settings.tradingMode });
    auditLogger(user.id, 'toggle_trading_mode', 'User', user._id, { newMode: user.settings.tradingMode }, req.ip);
    io.emit('user_update', { userId: user._id, tradingMode: user.settings.tradingMode }); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
