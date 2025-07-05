const LearningModule = require('../models/LearningModule');
const User = require('../models/User');
const Badge = require('../models/Badge');
const auditLogger = require('../utils/auditLogger');
const { calculateLevel, checkAchievements, updateLearningStreak } = require('../utils/gamificationUtils');
const { createSocialFeedEntry } = require('./socialController');

// @desc    Create new learning module
// @route   POST /api/learningmodules
// @access  Private (Admin)
exports.createLearningModule = async (req, res) => {
  try {
    const newModule = new LearningModule(req.body);
    const module = await newModule.save();
    res.status(201).json(module);
    auditLogger(req.user.id, 'create_learning_module', 'LearningModule', module._id, { title: module.title }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all learning modules
// @route   GET /api/learningmodules
// @access  Public
exports.getLearningModules = async (req, res) => {
  try {
    const modules = await LearningModule.find().sort({ createdAt: -1 });
    res.json(modules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get learning module by ID or Slug
// @route   GET /api/learningmodules/:id
// @access  Public
exports.getLearningModuleById = async (req, res) => {
  try {
    let module;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      module = await LearningModule.findById(req.params.id);
    } else {
      module = await LearningModule.findOne({ slug: req.params.id });
    }

    if (!module) {
      return res.status(404).json({ msg: 'Learning module not found' });
    }
    res.json(module);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Learning module not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update learning module
// @route   PUT /api/learningmodules/:id
// @access  Private (Admin)
exports.updateLearningModule = async (req, res) => {
  try {
    let module = await LearningModule.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ msg: 'Learning module not found' });
    }

    module = await LearningModule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(module);
    auditLogger(req.user.id, 'update_learning_module', 'LearningModule', module._id, { title: module.title, updatedFields: Object.keys(req.body) }, req.ip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Learning module not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete learning module
// @route   DELETE /api/learningmodules/:id
// @access  Private (Admin)
exports.deleteLearningModule = async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ msg: 'Learning module not found' });
    }

    await LearningModule.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Learning module removed' });
    auditLogger(req.user.id, 'delete_learning_module', 'LearningModule', module._id, { title: module.title }, req.ip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Learning module not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Mark learning module as completed
// @route   POST /api/learningmodules/:id/complete
// @access  Private
exports.completeLearningModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const userId = req.user.id;

    const module = await LearningModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({ msg: 'Learning module not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.gamification.completedModules.includes(moduleId)) {
      user.gamification.completedModules.push(moduleId);
      user.gamification.xp += module.rewards.xp; // Award XP
      user.gamification.level = calculateLevel(user.gamification.xp); // Update user level
      io.emit('new_notification', { userId: user._id, message: `You earned ${module.rewards.xp} XP for completing ${module.title}!` });

      // Check for badges
      // Example: Award 'First Module Complete' badge
      const firstModuleBadge = await Badge.findOne({ name: 'First Module Complete' });
      if (firstModuleBadge && !user.gamification.badges.includes(firstModuleBadge.name)) {
        user.gamification.badges.push(firstModuleBadge.name);
        user.gamification.xp += firstModuleBadge.rewardXp; // Award XP for badge
        io.emit('new_notification', { userId: user._id, message: `Congratulations! You earned the '${firstModuleBadge.name}' badge!` });
        createSocialFeedEntry(userId, 'badge_earned', `earned the '${firstModuleBadge.name}' badge!`);
      }

      updateLearningStreak(user); // Update learning streak
      await checkAchievements(user, module, io); // Check for achievements

      // TODO: Add logic for simulation credits
      await user.save();
    }

    auditLogger(userId, 'complete_module', 'LearningModule', module._id, { title: module.title }, req.ip);
    createSocialFeedEntry(userId, 'module_completed', `completed the learning module: ${module.title}`);

    res.json({ msg: 'Learning module marked as completed', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};