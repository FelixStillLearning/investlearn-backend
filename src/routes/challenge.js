const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const challengeController = require('../controllers/challengeController');

// @route   POST api/challenges
// @desc    Create a challenge
// @access  Private (Admin)
router.post(
  '/',
  [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('rules.duration', 'Duration is required and must be a number').isNumeric(),
    check('rules.startingCapital', 'Starting capital is required and must be a number').isNumeric(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601()
  ]],
  challengeController.createChallenge
);

// @route   GET api/challenges
// @desc    Get all challenges
// @access  Public
router.get('/', challengeController.getChallenges);

// @route   GET api/challenges/:id
// @desc    Get challenge by ID
// @access  Public
router.get('/:id', challengeController.getChallengeById);

// @route   PUT api/challenges/:id
// @desc    Update challenge
// @access  Private (Admin)
router.put(
  '/:id',
  [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('rules.duration', 'Duration is required and must be a number').isNumeric(),
    check('rules.startingCapital', 'Starting capital is required and must be a number').isNumeric(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601()
  ]],
  challengeController.updateChallenge
);

// @route   DELETE api/challenges/:id
// @desc    Delete challenge
// @access  Private (Admin)
router.delete('/:id', auth, challengeController.deleteChallenge);

// @route   POST api/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post(
  '/:id/join',
  [auth, [
    check('portfolioId', 'Portfolio ID is required').not().isEmpty()
  ]],
  challengeController.joinChallenge
);

// @route   PUT api/challenges/:id/update-leaderboard
// @desc    Update challenge leaderboard
// @access  Private (Admin/Internal)
router.put('/update-leaderboard/:id', auth, challengeController.updateLeaderboard);

// @route   POST api/challenges/:id/distribute-rewards
// @desc    Distribute rewards for a completed challenge
// @access  Private (Admin/Internal)
router.post('/distribute-rewards/:id', auth, challengeController.distributeRewards);

// @route   GET api/challenges/:id/history
// @desc    Get challenge history by ID
// @access  Public
router.get('/:id/history', challengeController.getChallengeHistory);

// @route   GET api/challenges/history
// @desc    Get user's challenge history and stats
// @access  Private
router.get('/history', auth, challengeController.getUserChallengeHistory);

module.exports = router;
