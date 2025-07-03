const ChatMessage = require('../models/ChatMessage');

// @desc    Get chat messages for a challenge
// @route   GET /api/chat/:challengeId
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ challengeId: req.params.challengeId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Send a chat message
// @route   POST /api/chat/:challengeId
// @access  Private
exports.sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { challengeId } = req.params;
    const userId = req.user.id;
    const username = req.user.username; // Assuming username is available in req.user from auth middleware

    const newMessage = new ChatMessage({
      challengeId,
      userId,
      username,
      message
    });

    const chatMessage = await newMessage.save();

    // Emit message to all clients in the challenge room
    req.app.get('socketio').to(challengeId).emit('chat_message', chatMessage);

    res.status(201).json(chatMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
