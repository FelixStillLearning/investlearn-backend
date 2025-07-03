const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { firstName, lastName, country, riskTolerance, profileVisibility } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update profile fields
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (country) user.profile.country = country;
    if (riskTolerance) user.profile.riskTolerance = riskTolerance;

    // Update privacy settings
    if (profileVisibility) user.settings.privacy.profileVisibility = profileVisibility;

    await user.save();

    res.json(user);
    auditLogger(req.user.id, 'update_profile', 'User', user._id, { updatedFields: Object.keys(req.body) }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Follow a user
// @route   PUT /api/users/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (userToFollow._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }

    // Add to following list of current user
    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      await currentUser.save();
    }

    // Add to followers list of user being followed
    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
      await userToFollow.save();
    }

    res.json({ msg: 'User followed successfully' });
    auditLogger(req.user.id, 'follow_user', 'User', userToFollow._id, { followedUser: userToFollow.username }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (userToUnfollow._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot unfollow yourself' });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(
      (follow) => follow.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    // Remove from followers list of user being unfollowed
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    res.json({ msg: 'User unfollowed successfully' });
    auditLogger(req.user.id, 'unfollow_user', 'User', userToUnfollow._id, { unfollowedUser: userToUnfollow.username }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ 'gamification.xp': -1 })
      .limit(10) // Top 10 users
      .select('username profile.avatar gamification.xp gamification.level');

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Toggle user trading mode
// @route   PUT /api/users/toggle-trading-mode
// @access  Private
exports.toggleTradingMode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Assuming user.settings.tradingMode exists and is a boolean
    user.settings.tradingMode = !user.settings.tradingMode;
    await user.save();

    res.json({ msg: 'Trading mode toggled successfully', tradingMode: user.settings.tradingMode });
    auditLogger(req.user.id, 'toggle_trading_mode', 'User', user._id, { tradingMode: user.settings.tradingMode }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};