const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const riskAssessmentController = require('../controllers/riskAssessmentController');

// @route   POST /api/risk-assessment
// @desc    Submit risk assessment questionnaire
// @access  Private
router.post(
  '/',
  [auth, [
    check('answers', 'Answers are required').not().isEmpty()
  ]],
  riskAssessmentController.submitRiskAssessment
);

// @route   GET /api/risk-assessment
// @desc    Get user's risk assessment score
// @access  Private
router.get('/', auth, riskAssessmentController.getRiskAssessment);

module.exports = router;
