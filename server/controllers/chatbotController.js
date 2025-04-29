const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { OpenAI } = require("openai");
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

exports.selectCharacter = async (req, res) => {
  const { character } = req.body;
  const userId = req.user.id; // req.user is set by auth middleware

  if (!character) {
    return res.status(400).json({ success: false, message: "Character is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { currentCharacter: character },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `You are now chatting with ${character}`,
      character: user.currentCharacter
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Handle the chat with the character
// Handle the chat with the character
exports.chatWithCharacter = async (req, res) => {
    const { userId, message } = req.body;

    const user = await User.findById(userId);

    if (!user || !user.currentCharacter) {
        return res.status(400).json({ success: false, error: "Please select a character first." });
    }

    const character = user.currentCharacter;

    // Retrieve the chat history for the user (if available)
    const previousChats = await Chat.find({ userId }).sort({ timestamp: 1 });

    // Format the chat history to feed it to the OpenAI model
    const messages = [
        {
            role: "system",
            content: `You are ${character} from the movies. Stay in character and respond conversationally.`,
        },
    ];

    // Add previous chats to the messages array
    previousChats.forEach(chat => {
        messages.push({
            role: "user",
            content: chat.message,
        });
        messages.push({
            role: "assistant",
            content: chat.response,
        });
    });

    // Add the new message from the user
    messages.push({
        role: "user",
        content: message,
    });

    // Prompt OpenAI
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
    });

    const reply = completion.choices[0].message.content;

    // Save the current message and response in the database
    await Chat.create({
        userId,
        character,
        message,
        response: reply,
    });

    return res.status(200).json({ success: true, reply });
};
