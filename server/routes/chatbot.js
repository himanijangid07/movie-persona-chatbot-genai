const express = require("express");
const { selectCharacter, chatWithCharacter } = require("../controllers/chatbotController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/select-character", isAuthenticated, selectCharacter);
router.post("/chat", isAuthenticated, chatWithCharacter);

module.exports = router;
