const User = require('../models/User');
const auditLogger = require('../utils/auditLogger');

// @desc    Submit risk assessment questionnaire
// @route   POST /api/risk-assessment
// @access  Private
exports.submitRiskAssessment = async (req, res) => {
  try {
    const { answers } = req.body; // Array of answers to questionnaire
    const userId = req.user.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Simple scoring logic (example)
    let score = 0;
    // Assuming answers is an array of objects like { questionId: 'q1', answer: 'a' }
    // Or just an array of scores for simplicity
    answers.forEach(answer => {
      // Implement your scoring logic here based on the answers
      // For example, if answer.value is a number, add it to score
      score += answer.value; 
    });

    user.profile.riskAssessmentScore = score;
    await user.save();

    res.json({ msg: 'Risk assessment submitted successfully', riskAssessmentScore: score });
    auditLogger(userId, 'risk_assessment_submit', 'User', user._id, { score, answers }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's risk assessment score
// @route   GET /api/risk-assessment
// @access  Private
exports.getRiskAssessment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profile.riskAssessmentScore');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ riskAssessmentScore: user.profile.riskAssessmentScore });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};