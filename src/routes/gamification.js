const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const gamificationController = require('../controllers/gamificationController');

// @route   PUT api/gamification/award-xp
// @desc    Award XP to a user
// @access  Private
router.put(
  '/award-xp',
  [auth, [
    check('userId', 'User ID is required').not().isEmpty(),
    check('xpAmount', 'XP amount is required and must be a number').isNumeric()
  ]],
  gamificationController.awardXp
);

// @route   GET api/gamification/:userId
// @desc    Get user gamification data
// @access  Private
router.get('/:userId', auth, gamificationController.getUserGamification);

// @route   PUT api/gamification/update-streak
// @desc    Update user's learning streak
// @access  Private
router.put('/update-streak', auth, gamificationController.updateStreak);

module.exports = router;
