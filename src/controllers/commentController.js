const Comment = require('../models/Comment');
const auditLogger = require('../utils/auditLogger');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res) => {
  const { targetType, targetId, content } = req.body;

  try {
    const newComment = new Comment({
      userId: req.user.id,
      targetType,
      targetId,
      content
    });

    const comment = await newComment.save();
    res.status(201).json(comment);
    auditLogger(req.user.id, 'add_comment', 'Comment', comment._id, { targetType, targetId }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get comments for a target
// @route   GET /api/comments/:targetType/:targetId
// @access  Public
exports.getComments = async (req, res) => {
  const { targetType, targetId } = req.params;

  try {
    const comments = await Comment.find({ targetType, targetId })
      .populate('userId', 'username profile.avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user owns comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.remove();

    res.json({ msg: 'Comment removed' });
    auditLogger(req.user.id, 'delete_comment', 'Comment', comment._id, {}, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};