const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const socialController = require('../controllers/socialController');

// @route   GET api/social/feed
// @desc    Get social feed
// @access  Private
router.get('/feed', auth, socialController.getSocialFeed);

module.exports = router;