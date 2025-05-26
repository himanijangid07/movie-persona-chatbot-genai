const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel'); // Adjust path as needed

// Save chat history
router.post('/chat-history', async (req, res) => {
  try {
    const { userId, character, messages } = req.body;
    
    // Log incoming request data for debugging
    console.log('Request data:', req.body);

    // Validate the input
    if (!userId || !character || !messages) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upsert chat history
    let chat = await Chat.findOneAndUpdate(
      { userId, character },
      { messages },
      { new: true, upsert: true }
    );

    console.log('Saved/Updated chat:', chat);  // Log saved/updated chat

    res.json({ success: true, chat });
  } catch (err) {
    console.error('Error saving chat history:', err);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

// Get chat history
router.get('/chat-history', async (req, res) => {
  try {
    const { userId, character } = req.query;

    // Find chat history for user and character
    const chat = await Chat.findOne({ userId, character });

    if (!chat) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    res.json(chat);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;
