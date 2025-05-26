const express = require("express");
const { selectCharacter, chatWithCharacter } = require("../controllers/chatbotController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/select-character", isAuthenticated, selectCharacter); // Character selection
router.post("/chat", isAuthenticated, chatWithCharacter); // Chat with character

module.exports = router;
