const User = require("../models/userModel");
const Chat = require("../models/chatModel");

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
exports.chatWithCharacter = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user || !user.currentCharacter) {
            return res.status(400).json({ success: false, error: "Please select a character first." });
        }

        const character = user.currentCharacter;

        const reply = `${character} says: Interesting that you said, "${message}"`;

        await Chat.create({
            userId,
            character,
            message,
            response: reply,
        });

        return res.status(200).json({ success: true, reply });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Chat failed" });
    }
};