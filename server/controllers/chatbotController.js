const User = require("../models/userModel");
const Chat = require("../models/chatModel");
require("dotenv").config();
const axios = require("axios");

// --- Helper: Language Detection ---
function detectLanguage(text) {
  const hindiWords = ["hai", "kya", "bhai", "re", "ho", "ka", "ab", "toh", "mujhe", "bhi", "kahan"];
  let hindiCount = 0;

  text.split(" ").forEach(word => {
    if (hindiWords.includes(word.toLowerCase())) hindiCount++;
  });

  return hindiCount > 3 ? "hinglish" : "english";
}

// --- Helper: Emoji Tone Enhancer ---
function addEmojiTone(response) {
  const positiveWords = ["great", "awesome", "love", "happy", "yes", "sure", "enjoy", "fun", "cool", "nice"];
  const negativeWords = ["no", "not", "hate", "angry", "sad", "bad", "upset", "annoyed"];

  let score = 0;
  const words = response.toLowerCase().split(/\W+/);

  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  if (score > 1) return response + " 😊";
  if (score < -1) return response + " 😞";
  return response + " 🤔";
}

// --- Helper: Replace Actions with Emojis ---
function replaceActionsWithEmojis(text) {
  const actionMap = {
    "\\*smirks\\*": "😏",
    "\\*laughs\\*": "😂",
    "\\*grins\\*": "😁",
    "\\*sighs\\*": "😔",
    "\\*winks\\*": "😉",
    "\\*angry\\*": "😠",
    "\\*crying\\*": "😭"
  };

  Object.keys(actionMap).forEach(actionPattern => {
    const regex = new RegExp(actionPattern, "gi");
    text = text.replace(regex, actionMap[actionPattern]);
  });

  return text;
}

// --- Route: Select Character ---
exports.selectCharacter = async (req, res) => {
  const { character } = req.body;
  const userId = req.user.id;

  if (!character) {
    return res.status(400).json({ success: false, message: "Character is required" });
  }

  try {
    const tmdbRes = await axios.get(
      `https://api.themoviedb.org/3/search/person?query=${character}&api_key=${process.env.TMDB_API_KEY}`
    );

    const person = tmdbRes.data.results[0];
    let bio = "";
    let knownFor = "";

    if (person) {
      knownFor = person.known_for?.map(movie => movie.title || movie.name).join(", ") || "";
      bio = `Known for: ${knownFor}. Popularity score: ${person.popularity}.`;
    }

    const characterPrompt = `You are ${character}, a fictional character from movies.

Your role is to engage the user in a realistic conversation in your unique voice and tone.

🚫 STRICT RULE: Never repeat or quote the user's message — not even partially. 
Never echo questions or answers. Just respond directly, naturally, and creatively.

⚠️ Never mention you are an AI. Always stay in character, with wit, emotion, and depth.`;

    const user = await User.findByIdAndUpdate(
      userId,
      { currentCharacter: character, characterPrompt: characterPrompt },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `You are now chatting with ${character}`,
      character: user.currentCharacter
    });

  } catch (error) {
    console.error("TMDB fetch error:", error.message);
    return res.status(500).json({ success: false, error: "Character lookup failed" });
  }
};

// --- Route: Chat with Character ---
exports.chatWithCharacter = async (req, res) => {
  const { userId, message } = req.body;
  const user = await User.findById(userId);

  if (!user || !user.currentCharacter) {
    return res.status(400).json({ success: false, error: "Please select a character first." });
  }

  const character = user.currentCharacter;
  const language = detectLanguage(message);
  let characterPrompt = user.characterPrompt || "";

  if (language === "hinglish") {
    characterPrompt = `You are ${character}, a Bollywood character. Talk in Hinglish (mix of Hindi and English, written in English script).
⚠️ Important: Do NOT repeat or quote the user's message in your reply. Respond naturally, in your iconic slang and punchlines. Never break character or say you are an AI.`;
  } else {
    characterPrompt = `You are ${character}, a fictional character from movies. 
Your role is to engage the user in a realistic conversation in your own voice and tone. 
⚠️ Important: Do NOT repeat or quote the user's message in your reply. Respond directly and naturally. 
Never mention being an AI. Stay in character with wit, emotion, and depth.`;
  }

  const previousChats = await Chat.find({ userId }).sort({ timestamp: -1 }).limit(10).lean();
  previousChats.reverse();

  const messages = [
    { role: "system", content: characterPrompt },
    ...previousChats.flatMap(chat => [
      { role: "user", content: chat.message },
      { role: "assistant", content: chat.response }
    ]),
    { role: "user", content: `Respond as ${character} to the following, without repeating it: ${message}` }
  ];

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.MODEL_ID || "meta-llama/llama-3-70b-instruct",
        messages,
        temperature: 0.7,
        max_tokens: 400
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error("No choices returned from OpenRouter");
    }

    let reply = response.data.choices[0].message.content;
    reply = addEmojiTone(reply);
    reply = replaceActionsWithEmojis(reply);

    await Chat.create({
      userId,
      character,
      message,
      response: reply,
    });

    return res.status(200).json({ success: true, reply });

  } catch (error) {
    console.error("❌ OpenRouter API error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: "OpenRouter API Error" });
  }
};