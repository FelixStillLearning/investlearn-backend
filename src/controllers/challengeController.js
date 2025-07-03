const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const auditLogger = require('../utils/auditLogger');

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private (Admin)
exports.createChallenge = async (req, res) => {
  try {
    const newChallenge = new Challenge(req.body);
    const challenge = await newChallenge.save();
    res.status(201).json(challenge);
    auditLogger(req.user.id, 'create_challenge', 'Challenge', challenge._id, { title: challenge.title, type: challenge.type }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Public
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Admin)
exports.updateChallenge = async (req, res) => {
  try {
    let challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(challenge);
    auditLogger(req.user.id, 'update_challenge', 'Challenge', challenge._id, { title: challenge.title, updatedFields: Object.keys(req.body) }, req.ip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Admin)
exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    await Challenge.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Challenge removed' });
    auditLogger(req.user.id, 'delete_challenge', 'Challenge', challenge._id, { title: challenge.title }, req.ip);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Join a challenge
// @route   POST /api/challenges/:id/join
// @access  Private
exports.joinChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;
    const { portfolioId } = req.body;

    let challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    // Check if user already joined
    if (challenge.participants.some(p => p.userId.toString() === userId)) {
      return res.status(400).json({ msg: 'You have already joined this challenge' });
    }

    // Check if portfolio exists and belongs to user
    const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found or does not belong to you' });
    }

    challenge.participants.push({ userId, portfolioId });
    await challenge.save();

    res.json({ msg: 'Successfully joined challenge', challenge });
    auditLogger(userId, 'join_challenge', 'Challenge', challenge._id, { challengeTitle: challenge.title, portfolioId }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update challenge leaderboard (simplified - would be a cron job in real app)
// @route   PUT /api/challenges/:id/update-leaderboard
// @access  Private (Admin/Internal)
const recordLeaderboardSnapshot = async (challengeId) => {
  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      console.error('Challenge not found for snapshot');
      return;
    }

    // Ensure leaderboard is populated before taking snapshot
    if (!challenge.leaderboard || challenge.leaderboard.length === 0) {
      console.warn('Leaderboard is empty, skipping snapshot for challenge:', challengeId);
      return;
    }

    challenge.history.push({
      date: new Date(),
      leaderboardSnapshot: challenge.leaderboard.map(entry => ({
        userId: entry.userId,
        username: entry.username,
        return: entry.return,
        returnPercentage: entry.returnPercentage,
        rank: entry.rank
      }))
    });
    await challenge.save();
    console.log(`Leaderboard snapshot recorded for challenge ${challengeId}`);
  } catch (error) {
    console.error('Error recording leaderboard snapshot:', error);
  }
};

exports.updateLeaderboard = async (req, res) => {
  try {
    const challengeId = req.params.id;
    let challenge = await Challenge.findById(challengeId).populate('participants.portfolioId');

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    const leaderboard = [];
    for (const participant of challenge.participants) {
      const portfolio = participant.portfolioId;
      if (portfolio) {
        // Recalculate performance for each participant's portfolio
        // This is a simplified example. In a real app, you'd need to fetch latest market data
        // and re-evaluate portfolio.allocations to get current marketValue, totalReturn, etc.
        const currentReturn = portfolio.performance.totalReturn; // Assuming this is up-to-date
        const returnPercentage = portfolio.performance.returnPercentage; // Assuming this is up-to-date

        const user = await User.findById(participant.userId).select('username');

        leaderboard.push({
          userId: participant.userId,
          username: user ? user.username : 'Unknown',
          return: currentReturn,
          returnPercentage: returnPercentage,
        });
      }
    }

    // Sort leaderboard by returnPercentage (descending)
    leaderboard.sort((a, b) => b.returnPercentage - a.returnPercentage);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    challenge.leaderboard = leaderboard;
    await challenge.save();

    res.json({ msg: 'Leaderboard updated', leaderboard });
    await recordLeaderboardSnapshot(challengeId);
    auditLogger(req.user.id, 'update_challenge_leaderboard', 'Challenge', challenge._id, { challengeTitle: challenge.title, updatedParticipants: leaderboard.length }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Distribute rewards for a completed challenge
// @route   POST /api/challenges/:id/distribute-rewards
// @access  Private (Admin/Internal - would be triggered by cron)
exports.distributeRewards = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    if (challenge.status !== 'completed') {
      return res.status(400).json({ msg: 'Challenge is not completed yet' });
    }

    // TODO: Implement actual reward distribution logic
    // - Award winner rewards (XP, badges, cash)
    // - Award participation rewards (XP, badges)
    // - Update user profiles (XP, badges, wallet balance)

    res.json({ msg: 'Rewards distribution initiated (placeholder)' });
    auditLogger(req.user.id, 'distribute_challenge_rewards', 'Challenge', challenge._id, { challengeTitle: challenge.title }, req.ip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's challenge history and stats
// @route   GET /api/challenges/history
// @access  Private
exports.getChallengeHistory = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).select('history');

    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.json(challenge.history);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's challenge history and stats
// @route   GET /api/challenges/history
// @access  Private
exports.getUserChallengeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const challenges = await Challenge.find({
      'participants.userId': userId,
      status: 'completed' // Only show completed challenges in history
    }).populate('participants.portfolioId', 'name performance'); // Populate portfolio details

    const history = challenges.map(challenge => {
      const participantEntry = challenge.participants.find(p => p.userId.toString() === userId);
      return {
        _id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        yourPerformance: participantEntry ? participantEntry.finalPerformance : null,
        yourPortfolio: participantEntry ? participantEntry.portfolioId : null,
        finalLeaderboard: challenge.leaderboard // Include final leaderboard
      };
    });

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};