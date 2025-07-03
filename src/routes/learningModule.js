const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const learningModuleController = require('../controllers/learningModuleController');

// @route   POST api/learningmodules
// @desc    Create a learning module
// @access  Private (Admin)
router.post(
  '/',
  [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('estimatedTime', 'Estimated time is required and must be a number').isNumeric()
  ]],
  learningModuleController.createLearningModule
);

// @route   GET api/learningmodules
// @desc    Get all learning modules
// @access  Public
router.get('/', learningModuleController.getLearningModules);

// @route   GET api/learningmodules/:id
// @desc    Get learning module by ID or Slug
// @access  Public
router.get('/:id', learningModuleController.getLearningModuleById);

// @route   PUT api/learningmodules/:id
// @desc    Update learning module
// @access  Private (Admin)
router.put(
  '/:id',
  [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('estimatedTime', 'Estimated time is required and must be a number').isNumeric()
  ]],
  learningModuleController.updateLearningModule
);

// @route   DELETE api/learningmodules/:id
// @desc    Delete learning module
// @access  Private (Admin)
router.delete('/:id', auth, learningModuleController.deleteLearningModule);

module.exports = router;
