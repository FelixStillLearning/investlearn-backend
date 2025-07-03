const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const notificationController = require('../controllers/notificationController');

// @route   POST /api/notifications
// @desc    Create a new notification (internal use)
// @access  Private (Admin/Internal)
router.post(
  '/',
  [auth, [
    check('userId', 'User ID is required').not().isEmpty(),
    check('type', 'Notification type is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty()
  ]],
  notificationController.createNotification
);

// @route   GET /api/notifications
// @desc    Get notifications for the authenticated user
// @access  Private
router.get('/', auth, notificationController.getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/read/:id', auth, notificationController.markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
