const express = require("express");
const { selectCharacter, chatWithCharacter } = require("../controllers/chatbotController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/select-character", isAuthenticated, selectCharacter); // Character selection
router.post("/", isAuthenticated, chatWithCharacter); // Chat with character

router.post("/test", (req, res) => {
    res.send("Chat route is working!");
  });
  

module.exports = router;
