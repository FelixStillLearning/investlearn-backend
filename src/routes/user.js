const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateUserProfile);

// @route   PUT api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.put('/follow/:id', auth, userController.followUser);

// @route   PUT api/users/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.put('/unfollow/:id', auth, userController.unfollowUser);

// @route   GET api/users/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;