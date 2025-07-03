const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const chatController = require('../controllers/chatController');

// @route   GET /api/chat/:challengeId
// @desc    Get chat messages for a challenge
// @access  Private
router.get('/:challengeId', auth, chatController.getChatMessages);

// @route   POST /api/chat/:challengeId
// @desc    Send a chat message
// @access  Private
router.post(
  '/:challengeId',
  [auth, [
    check('message', 'Message is required').not().isEmpty()
  ]],
  chatController.sendChatMessage
);

module.exports = router;
