const User = require("../models/userModel");
const Chat = require("../models/chatModel");
require("dotenv").config();
const axios = require("axios");

// Function to detect language (simplified version)
function detectLanguage(text) {
  const hindiWords = ["hai", "kya", "bhai", "re", "ho", "ka", "ab", "toh", "mujhe", "bhi", "kahan"];
  let hindiCount = 0;

  // Simple check for Hinglish (Hindi + English mixed)
  text.split(" ").forEach(word => {
    if (hindiWords.includes(word.toLowerCase())) {
      hindiCount++;
    }
  });

  // If more than 3 Hindi words are detected, classify as Hinglish
  if (hindiCount > 3) {
    return "hinglish";
  }
  return "english";
}

exports.selectCharacter = async (req, res) => {
  const { character } = req.body;
  const userId = req.user.id;

  if (!character) {
    return res.status(400).json({ success: false, message: "Character is required" });
  }

  try {
    // Call TMDB search API
    const tmdbRes = await axios.get(
      `https://api.themoviedb.org/3/search/person?query=${character}&api_key=${process.env.TMDB_API_KEY}`
    );

    const person = tmdbRes.data.results[0]; // First match
    let bio = "";
    let knownFor = "";

    if (person) {
      knownFor = person.known_for?.map(movie => movie.title || movie.name).join(", ") || "";
      bio = `Known for: ${knownFor}. Popularity score: ${person.popularity}.`;
    }

    const prompt = `You are ${character}, a fictional character from the movies. ${bio}
Speak in your unique style. You have all your powers, emotions, memories, and relationships. 
Do NOT mention being an AI. Stay in character and respond with wit, emotion, and depth.`;

    // Update user with character and prompt
    const user = await User.findByIdAndUpdate(
      userId,
      { currentCharacter: character, characterPrompt: prompt },
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

exports.chatWithCharacter = async (req, res) => {
  console.log("🔥 OpenRouter chat route hit");

  const { userId, message } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.currentCharacter) {
    return res.status(400).json({ success: false, error: "Please select a character first." });
  }
  const character = user.currentCharacter;

  // Detect language (Hinglish or English)
  const language = detectLanguage(message);

  // Set prompt based on detected language
  let characterPrompt = user.characterPrompt || `You are ${character}, a fictional character from the movies. ${bio} Speak in your unique style. You have all your powers, emotions, memories, and relationships. Do NOT mention being an AI. Stay in character and respond with wit, emotion, and depth.`;

  if (language === "hinglish") {
    characterPrompt = `You are ${character}, a Bollywood character from Indian films. ${bio} Speak exactly like how you do in movies – in Hinglish (mix of Hindi and English typed in English script). Use your iconic slang, punchlines, jokes, and emotions. Never break character. Do NOT say you are an AI. Always stay true to your movie personality.`;
  } else {
    characterPrompt = `You are ${character}, a fictional character from the movies. ${bio} Speak in a casual, witty, and engaging way. Do NOT mention being an AI. Stay in character and respond with wit, emotion, and depth.`;
  }

  const previousChats = await Chat.find({ userId }).sort({ timestamp: 1 });

  const messages = [
    {
      role: "system",
      content: characterPrompt,
    },
    ...previousChats.flatMap(chat => [
      { role: "user", content: chat.message },
      { role: "assistant", content: chat.response }
    ]),
    { role: "user", content: message }
  ];

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.MODEL_ID || "meta-llama/llama-3-70b-instruct",
        messages,
        temperature: 0.9,
        max_tokens: 400
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ OpenRouter full response:", JSON.stringify(response.data, null, 2));

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error("No choices returned from OpenRouter");
    }

    const reply = response.data.choices[0].message.content;

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
