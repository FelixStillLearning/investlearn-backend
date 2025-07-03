const SocialFeed = require('../models/SocialFeed');

exports.createSocialFeedEntry = async (userId, type, message, portfolioId = null) => {
  try {
    const newEntry = new SocialFeed({
      userId,
      type,
      message,
      portfolioId
    });
    await newEntry.save();
  } catch (err) {
    console.error('Error creating social feed entry:', err.message);
  }
};

exports.getSocialFeed = async (req, res) => {
  try {
    const feed = await SocialFeed.find()
      .populate('userId', 'username profile.avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(feed);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};