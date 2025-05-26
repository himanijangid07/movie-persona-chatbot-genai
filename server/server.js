const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoute");
const errorHandler = require("./middlewares/errorMiddleware");
const chatbotRoutes = require("./routes/chatbot");
const chatHistoryRoute = require('./routes/chatHistory');

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://movie-persona-chatbot-genai-7m11e99c3-himanijangid07s-projects.vercel.app'  // Replace with your actual frontend URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use(chatHistoryRoute);

const port = process.env.PORT || 8080;

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatbotRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server running on ${process.env.DEV_MODE} on port ${port}`);
});
