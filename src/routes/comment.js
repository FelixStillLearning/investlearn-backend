const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const commentController = require('../controllers/commentController');

// @route   POST api/comments
// @desc    Add a comment
// @access  Private
router.post(
  '/',
  [auth, [
    check('targetType', 'Target type is required').not().isEmpty(),
    check('targetId', 'Target ID is required').not().isEmpty(),
    check('content', 'Comment content is required').not().isEmpty()
  ]],
  commentController.addComment
);

// @route   GET api/comments/:targetType/:targetId
// @desc    Get comments for a target
// @access  Public
router.get('/:targetType/:targetId', commentController.getComments);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;