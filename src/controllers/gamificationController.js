const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const Badge = require('../models/Badge');
const auditLogger = require('../utils/auditLogger');
const io = require('../server').io; // Import the Socket.io instance

// @desc    Award XP to a user
// @route   PUT /api/gamification/award-xp
// @access  Private
exports.awardXp = async (req, res) => {
  try {
    const { userId, xpAmount, moduleCompleted, badgeEarned } = req.body;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.gamification.xp += xpAmount;

    // Simple level up logic (can be more complex)
    const XP_PER_LEVEL = 1000; // Example: 1000 XP per level
    user.gamification.level = Math.floor(user.gamification.xp / XP_PER_LEVEL) + 1;

    if (moduleCompleted) {
      // Logic to track completed modules and prevent re-awarding XP
      // For simplicity, assuming moduleCompleted is module ID
      // In a real app, you'd have a user_module_progress collection
    }

    if (badgeEarned) {
      // Add badge to user's badges if not already present
      if (!user.gamification.badges.includes(badgeEarned)) {
        user.gamification.badges.push(badgeEarned);
      }
    }

    await user.save();

    res.json({ msg: 'XP awarded successfully', user: user.gamification });
    auditLogger(userId, 'award_xp', 'User', user._id, { xpAmount, moduleCompleted, badgeEarned }, req.ip);
    io.emit('gamification_update', user.gamification); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user's learning streak
// @route   PUT /api/gamification/update-streak
// @access  Private
exports.updateStreak = async (req, res) => {
  try {
    const userId = req.user.id; // Get user from authenticated token
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const lastActivity = user.gamification.streak.lastActivity;
    let lastActivityDate = null;
    if (lastActivity) {
      lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);
    }

    // Calculate difference in days
    const diffTime = Math.abs(today.getTime() - (lastActivityDate ? lastActivityDate.getTime() : 0));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (!lastActivity || diffDays === 1) {
      // Continue streak if last activity was yesterday or no activity yet
      user.gamification.streak.current += 1;
    } else if (diffDays > 1) {
      // Reset streak if activity was not yesterday
      user.gamification.streak.current = 1;
    }
    // If diffDays is 0, it means activity is on the same day, so streak doesn't change

    user.gamification.streak.lastActivity = Date.now();

    if (user.gamification.streak.current > user.gamification.streak.longest) {
      user.gamification.streak.longest = user.gamification.streak.current;
    }

    await user.save();

    res.json({ msg: 'Streak updated successfully', streak: user.gamification.streak });
    auditLogger(userId, 'update_streak', 'User', user._id, { currentStreak: user.gamification.streak.current, longestStreak: user.gamification.streak.longest }, req.ip);
    io.emit('gamification_update', user.gamification); // Emit update
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user gamification data
// @route   GET /api/gamification/:userId
// @access  Private
exports.getUserGamification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('gamification');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.gamification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};