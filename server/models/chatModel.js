const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    character: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Chat", chatSchema);
