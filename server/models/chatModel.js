// models/ChatModel.js

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  character: { type: String, required: true },
  messages: [
    {
      from: { type: String, enum: ['user', 'bot'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
