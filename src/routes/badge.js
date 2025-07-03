const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const badgeController = require('../controllers/badgeController');

// @route   POST api/badges
// @desc    Create a badge
// @access  Private (Admin)
router.post(
  '/',
  [auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('icon', 'Icon is required').not().isEmpty(),
    check('criteria', 'Criteria is required').not().isEmpty()
  ]],
  badgeController.createBadge
);

// @route   GET api/badges
// @desc    Get all badges
// @access  Public
router.get('/', badgeController.getBadges);

// @route   GET api/badges/:id
// @desc    Get badge by ID
// @access  Public
router.get('/:id', badgeController.getBadgeById);

// @route   PUT api/badges/:id
// @desc    Update badge
// @access  Private (Admin)
router.put(
  '/:id',
  [auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('icon', 'Icon is required').not().isEmpty(),
    check('criteria', 'Criteria is required').not().isEmpty()
  ]],
  badgeController.updateBadge
);

// @route   DELETE api/badges/:id
// @desc    Delete badge
// @access  Private (Admin)
router.delete('/:id', auth, badgeController.deleteBadge);

module.exports = router;
