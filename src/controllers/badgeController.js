const Badge = require('../models/Badge');

// @desc    Create new badge
// @route   POST /api/badges
// @access  Private (Admin)
exports.createBadge = async (req, res) => {
  try {
    const newBadge = new Badge(req.body);
    const badge = await newBadge.save();
    res.status(201).json(badge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
exports.getBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json(badges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get badge by ID
// @route   GET /api/badges/:id
// @access  Public
exports.getBadgeById = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({ msg: 'Badge not found' });
    }
    res.json(badge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Badge not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update badge
// @route   PUT /api/badges/:id
// @access  Private (Admin)
exports.updateBadge = async (req, res) => {
  try {
    let badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({ msg: 'Badge not found' });
    }

    badge = await Badge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(badge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Badge not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete badge
// @route   DELETE /api/badges/:id
// @access  Private (Admin)
exports.deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({ msg: 'Badge not found' });
    }

    await Badge.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Badge removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Badge not found' });
    }
    res.status(500).send('Server Error');
  }
};
