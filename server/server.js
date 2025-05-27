const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const colors = require("colors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoute");
const errorHandler = require("./middlewares/errorMiddleware");
const chatbotRoutes = require("./routes/chatbot");
const chatHistoryRoute = require('./routes/chatHistory');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://movie-persona-chatbot-genai.vercel.app', 'https://movie-persona-chatbot-genai-3txbj18a9-himanijangid07s-projects.vercel.app'],
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatbotRoutes);
app.use('/api/v1', chatHistoryRoute);

// Serve static React frontend
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route for React Router (MUST be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error middleware (should be last)
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on ${process.env.DEV_MODE} on port ${port}`);
});
